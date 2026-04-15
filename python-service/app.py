"""
Smart Electricity Dashboard — Python Analytics Microservice
Flask API for CSV processing, anomaly detection, and recommendations.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from scipy import stats

app = Flask(__name__)
CORS(app)

# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────

PEAK_HOURS = list(range(18, 23))  # 6 PM – 10 PM

def detect_anomalies(df: pd.DataFrame, threshold: float = 1.8):
    """Z-score based anomaly detection on units column."""
    if 'units' not in df.columns or len(df) < 3:
        df['anomaly'] = False
        df['anomalyScore'] = 0.0
        return df
    
    units_series = df['units'].astype(float)
    if units_series.std() == 0:
        df['anomaly'] = False
        df['anomalyScore'] = 0.0
        return df

    z_scores = np.abs(stats.zscore(units_series))
    df['anomalyScore'] = z_scores.round(4)
    df['anomaly'] = (z_scores > threshold).fillna(False)
    return df

def compute_trend(df: pd.DataFrame):
    """Linear regression trend over time."""
    if len(df) < 2:
        return {'slope': 0, 'direction': 'stable'}
    x = np.arange(len(df))
    slope, _, r, p, _ = stats.linregress(x, df['units'].astype(float))
    direction = 'increasing' if slope > 0 else ('decreasing' if slope < 0 else 'stable')
    return {
        'slope': round(float(slope), 4),
        'r_squared': round(float(r ** 2), 4),
        'p_value': round(float(p), 4),
        'direction': direction,
    }

def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """Clean / normalise incoming data."""
    if df.empty: return df
    # Drop completely empty rows
    df.dropna(how='all', inplace=True)
    # Ensure numeric columns are numeric
    for col in ['units', 'cost', 'hour']:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
    
    # Drop rows where units is missing / negative (if column exists)
    if 'units' in df.columns:
        df = df[df['units'].notna() & (df['units'] >= 0)]
    
    # Parse date
    if 'date' in df.columns:
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
        df = df[df['date'].notna()]
    return df.reset_index(drop=True)


# ──────────────────────────────────────────────────────────────────────────────
# Routes
# ──────────────────────────────────────────────────────────────────────────────

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'analytics'})


@app.route('/process', methods=['POST'])
def process():
    """
    Accepts JSON list of usage records, returns enriched records with
    anomaly flags, trend info, and monthly aggregates.
    """
    try:
        body = request.get_json(force=True)
        records = body.get('records', [])

        if not records:
            return jsonify({'error': 'No records provided'}), 400

        df = pd.DataFrame(records)
        df = clean_dataframe(df)

        if df.empty:
            return jsonify({'error': 'All records were invalid after cleaning'}), 400

        # Anomaly detection
        df = detect_anomalies(df)

        # Trend
        trend = compute_trend(df)

        # Monthly aggregates
        if 'date' in df.columns:
            df['month'] = df['date'].dt.to_period('M').astype(str)
            monthly = (
                df.groupby('month')
                  .agg(units=('units', 'sum'), cost=('cost', 'sum'))
                  .reset_index()
                  .to_dict(orient='records')
            )
        else:
            monthly = []

        # Peak hour flag — if 'hour' column present
        if 'hour' in df.columns:
            df['peakHour'] = df['hour'].astype(int).isin(PEAK_HOURS)
        else:
            df['peakHour'] = False

        # Convert dates back to string for JSON
        if 'date' in df.columns:
            df['date'] = df['date'].astype(str)

        return jsonify({
            'records': df.to_dict(orient='records'),
            'trend': trend,
            'monthly': monthly,
            'anomalyCount': int(df['anomaly'].sum()) if 'anomaly' in df.columns else 0,
            'cleanedCount': len(df),
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/recommendations', methods=['POST'])
def recommendations():
    """
    Returns energy-saving recommendations based on usage patterns.
    """
    try:
        body = request.get_json(force=True)
        records = body.get('records', [])

        if not records:
            return jsonify({'recommendations': []})

        df = pd.DataFrame(records)
        df = clean_dataframe(df)

        tips = []
        avg_units = float(df['units'].mean()) if ('units' in df.columns and not df.empty) else 0

        # Rule-based recommendations
        if avg_units > 400:
            tips.append({
                'type': 'high_usage',
                'severity': 'critical',
                'title': 'Very High Average Consumption',
                'message': f'Your average monthly usage is {avg_units:.1f} kWh. '
                           'Consider replacing old appliances with BEE 5-star rated ones.',
                'saving': '15–25%',
            })
        elif avg_units > 250:
            tips.append({
                'type': 'moderate_usage',
                'severity': 'warning',
                'title': 'Above-Average Consumption',
                'message': f'Average usage {avg_units:.1f} kWh/month. '
                           'Check if ACs, geysers, and refrigerators are energy-efficient.',
                'saving': '10–20%',
            })

        if not df.empty and ('units' in df.columns):
            trend = compute_trend(df)
            if trend['direction'] == 'increasing' and trend['slope'] > 5:
                tips.append({
                    'type': 'increasing_trend',
                    'severity': 'warning',
                    'title': 'Rising Consumption Trend',
                    'message': 'Your electricity usage is growing month-over-month. '
                               'Audit appliances that may have degraded efficiency.',
                    'saving': '5–15%',
                })

            anomaly_count = int(df['anomaly'].sum()) if 'anomaly' in df.columns else 0
            if anomaly_count > 0:
                tips.append({
                    'type': 'anomalies',
                    'severity': 'critical',
                    'title': f'{anomaly_count} Anomalous Reading(s) Detected',
                    'message': f'Unusual spikes were detected. Check for faulty wiring or '
                               'unauthorized appliance usage.',
                    'saving': 'Variable',
                })

        return jsonify({'recommendations': tips, 'avgMonthlyUnits': round(avg_units, 2)})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(port=5001, debug=True)
