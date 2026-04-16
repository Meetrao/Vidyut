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

# ──────────────────────────────────────────────────────────────────────────────
# Bharat Intelligence Core (India Contextual Analytics)
# ──────────────────────────────────────────────────────────────────────────────

PEAK_HOURS = list(range(18, 23))  # 6 PM – 10 PM

def get_seasonal_multiplier(date_obj):
    """Returns a multiplier allowing for higher 'Normal' usage during Indian seasons."""
    if not date_obj or pd.isna(date_obj): return 1.0
    month = date_obj.month
    # Indian Summer (Peak AC Load)
    if month in [4, 5, 6]: return 1.5
    # Festive Season (Lights, Celebrations)
    if month in [10, 11]: return 1.3
    return 1.0

def calculate_indian_baseline(df: pd.DataFrame):
    """Calculates the typical baseline usage for an Indian household (8-20 kWh range)."""
    if df.empty or 'units' not in df.columns:
        return 12.0 # Default urban Indian baseline
    
    units = df['units'].astype(float)
    if len(units) < 5:
        baseline = float(units.mean()) if not units.empty else 12.0
    else:
        # Use the interquartile range for larger datasets
        low, high = units.quantile([0.2, 0.8])
        steady_state = units[(units >= low) & (units <= high)]
        baseline = float(steady_state.mean())
    
    # Clip to realistic Indian household range (8-25 kWh)
    return max(8.0, min(25.0, baseline))

def detect_anomalies(df: pd.DataFrame):
    """
    Bharat-Aware Anomaly Detection.
    Triggered if units > (Baseline * Seasonal_Multiplier * 2.5)
    """
    if 'units' not in df.columns or df.empty:
        df['anomaly'] = False
        df['breachRatio'] = 0.0
        return df
    
    baseline = calculate_indian_baseline(df)
    
    def check_row(row):
        # Calculate row-specific multiplier based on date
        season_mod = get_seasonal_multiplier(row.get('date'))
        # Anomaly threshold: 2.5x of the seasonally adjusted baseline
        threshold = baseline * season_mod * 2.5
        is_anomaly = float(row['units']) > threshold
        # Score is the ratio of usage to the threshold
        score = float(row['units']) / (baseline * season_mod)
        return is_anomaly, round(float(score), 4)

    results = df.apply(check_row, axis=1)
    df['anomaly'] = [r[0] for r in results]
    df['breachRatio'] = [r[1] for r in results]
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
    df.dropna(how='all', inplace=True)
    for col in ['units', 'cost', 'hour']:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
    
    if 'units' in df.columns:
        df = df[df['units'].notna() & (df['units'] >= 0)]
    
    if 'date' in df.columns:
        # Save original strings if needed, but ensure datetime for logic
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
        df = df[df['date'].notna()]
    return df.reset_index(drop=True)

# ── Routes ────────────────────────────────────────────────────────────────────

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'analytics-bharat'})

@app.route('/process', methods=['POST'])
def process():
    try:
        body = request.get_json(force=True)
        records = body.get('records', [])
        if not records: return jsonify({'error': 'No records'}), 400

        df = pd.DataFrame(records)
        df = clean_dataframe(df)
        if df.empty: return jsonify({'error': 'Invalid data'}), 400

        # Bharat Anomaly Detection
        df = detect_anomalies(df)
        trend = compute_trend(df)

        if 'date' in df.columns:
            df['month'] = df['date'].dt.to_period('M').astype(str)
            monthly = (
                df.groupby('month')
                  .agg(units=('units', 'sum'), cost=('cost', 'sum'))
                  .reset_index()
                  .to_dict(orient='records')
            )
            df['date'] = df['date'].astype(str)
        else:
            monthly = []

        if 'hour' in df.columns:
            df['peakHour'] = df['hour'].astype(int).isin(PEAK_HOURS)
        else:
            df['peakHour'] = False

        return jsonify({
            'records': df.to_dict(orient='records'),
            'trend': trend,
            'monthly': monthly,
            'anomalyCount': int(df['anomaly'].sum()),
            'baseline': calculate_indian_baseline(df)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/recommendations', methods=['POST'])
def recommendations():
    try:
        body = request.get_json(force=True)
        records = body.get('records', [])
        if not records: return jsonify({'recommendations': []})

        df = pd.DataFrame(records)
        df = clean_dataframe(df)
        tips = []
        
        avg_units = float(df['units'].mean()) if not df.empty else 0
        baseline = calculate_indian_baseline(df)

        # Bharat-Specific Recommendations
        if avg_units > (baseline * 1.5):
            tips.append({
                'type': 'high_usage',
                'severity': 'critical',
                'title': 'High Baseline Deviation',
                'message': f'Your usage is 50% above your Indian household baseline. Check for persistent AC usage or old refrigerator seals.',
                'saving': '20–30%',
            })

        # Summer/Winter Logic based on Data Context
        target_month = pd.to_datetime('today').month
        if not df.empty and 'date' in df.columns:
            # Anchor season to the latest record in the provided data
            target_month = pd.to_datetime(df['date']).max().month

        # Summer (Peak Cooling)
        if target_month in [4, 5, 6]:
            tips.append({
                'type': 'seasonal',
                'severity': 'warning',
                'title': 'Summer Cooling Strategy',
                'message': 'Keep ACs at 24°C-26°C for optimal BEE savings. Clean filters for 15% better efficiency.',
                'saving': '15%',
            })
        
        # Winter (Peak Heating/Geyser)
        if target_month in [12, 1]:
            tips.append({
                'type': 'seasonal',
                'severity': 'warning',
                'title': 'Winter Geyser Optimization',
                'message': 'Geysers account for 40% of winter bills. Set thermostat to 60°C and use for 15 mins to save 20%.',
                'saving': '20%',
            })
        
        # Inverter/BEE Logic
        tips.append({
            'type': 'appliance',
            'severity': 'info',
            'title': 'Inverter & BEE Optimization',
            'message': 'Switching to 5-star BEE Inverter ACs can reduce cooling costs by 30% compared to non-inverter models.',
            'saving': '30%',
        })

        if not df.empty:
            anomaly_count = int(df['anomaly'].sum()) if 'anomaly' in df.columns else 0
            if anomaly_count > 0:
                tips.append({
                    'type': 'anomalies',
                    'severity': 'critical',
                    'title': f'Sentinel Alert: {anomaly_count} Spikes',
                    'message': 'Unusual 2.5x-3x spikes detected. This often points to faulty appliance wiring or geysers left on.',
                    'saving': 'Variable',
                })

        return jsonify({'recommendations': tips, 'avgMonthlyUnits': round(avg_units, 2)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(port=5001, debug=True)
