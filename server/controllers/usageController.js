const Usage = require('../models/Usage');
const Notification = require('../models/Notification');
const Alert = require('../models/Alert');
const { parseCSV } = require('../services/csvParser');
const axios = require('axios');

const PYTHON_URL = process.env.PYTHON_URL || 'http://localhost:5001';

// ── helpers ──────────────────────────────────────────────────────────────────

async function callPython(endpoint, payload) {
  try {
    const res = await axios.post(`${PYTHON_URL}${endpoint}`, payload, { timeout: 15000 });
    return { ok: true, data: res.data };
  } catch (err) {
    console.error(`Python Service Error [${endpoint}]:`, err.message);
    return { ok: false, data: null };
  }
}

/**
 * Checks a usage record against user-defined sentinels (Alerts)
 * and creates Notifications if thresholds are breached.
 */
async function checkSentinels(record) {
  try {
    const activeAlerts = await Alert.find();
    for (const alert of activeAlerts) {
      let breached = false;
      if (alert.type === 'cost' && record.cost >= alert.threshold) breached = true;
      if (alert.type === 'units' && record.units >= alert.threshold) breached = true;

      if (breached) {
        await Notification.create({
          type: 'sentinel_breach',
          title: `Sentinel Triggered: ${alert.name}`,
          message: `Threshold of ${alert.threshold} ${alert.type === 'cost' ? '₹' : 'kWh'} exceeded on ${new Date(record.date).toLocaleDateString()}. Recorded: ${record[alert.type]}`,
          severity: 'critical',
          relatedUsage: record._id
        });
      }
    }

    // Also auto-notify for AI-detected anomalies
    if (record.anomaly) {
      await Notification.create({
        type: 'anomaly',
        title: 'AI Anomaly Detected',
        message: `System identified an unusual consumption spike of ${record.units} kWh on ${new Date(record.date).toLocaleDateString()}.`,
        severity: 'warning',
        relatedUsage: record._id
      });
    }
  } catch (err) {
    console.error('Sentinel Check Error:', err.message);
  }
}

// ── controllers ───────────────────────────────────────────────────────────────

// GET /api/usage
exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filter = {};

    if (req.query.from || req.query.to) {
      filter.date = {};
      if (req.query.from) filter.date.$gte = new Date(req.query.from);
      if (req.query.to) filter.date.$lte = new Date(req.query.to);
    }
    if (req.query.anomaly === 'true') filter.anomaly = true;
    if (req.query.peakHour === 'true') filter.peakHour = true;
    if (req.query.source) filter.source = req.query.source;

    const total = await Usage.countDocuments(filter);
    const records = await Usage.find(filter)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ records, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/usage/stats
exports.getStats = async (req, res) => {
  try {
    const matchStage = {};
    if (req.query.from || req.query.to) {
      matchStage.date = {};
      if (req.query.from) matchStage.date.$gte = new Date(req.query.from);
      if (req.query.to) matchStage.date.$lte = new Date(req.query.to);
    }

    const pipeline = [
      ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),
      {
        $group: {
          _id: null,
          totalUnits: { $sum: '$units' },
          totalCost: { $sum: '$cost' },
          recordCount: { $sum: 1 },
          avgUnits: { $avg: '$units' },
          avgCost: { $avg: '$cost' },
          anomalyCount: { $sum: { $cond: ['$anomaly', 1, 0] } },
        },
      },
    ];

    const agg = await Usage.aggregate(pipeline);

    const monthly = await Usage.aggregate([
      ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          units: { $sum: '$units' },
          cost: { $sum: '$cost' },
          anomalies: { $sum: { $cond: ['$anomaly', 1, 0] } },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          month: {
            $dateToString: {
              format: '%Y-%m',
              date: { $dateFromParts: { year: '$_id.year', month: '$_id.month', day: 1 } },
            },
          },
          units: 1, cost: 1, anomalies: 1,
        },
      },
    ]);

    const stats = agg[0] || { totalUnits: 0, totalCost: 0, recordCount: 0, avgUnits: 0, avgCost: 0, anomalyCount: 0 };
    delete stats._id;
    
    // Add contextual Bharat Metadata
    const bharatMeta = {
      standardRange: "8–20 kWh/day",
      context: "Indian Urban Household",
      currentMonth: new Date().toLocaleString('en-IN', { month: 'long' })
    };

    res.json({ ...stats, monthly, bharatMeta });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/usage/daily
exports.getDaily = async (req, res) => {
  try {
    const filter = {};
    if (req.query.from) filter.date = { ...filter.date, $gte: new Date(req.query.from) };
    if (req.query.to) filter.date = { ...filter.date, $lte: new Date(req.query.to) };

    const records = await Usage.find(filter)
      .sort({ date: 1 })
      .select('date units cost anomaly anomalyScore peakHour');
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/usage/anomalies
exports.getAnomalies = async (req, res) => {
  try {
    const records = await Usage.find({ anomaly: true }).sort({ anomalyScore: -1 }).limit(100);
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/usage/recommendations
exports.getRecommendations = async (req, res) => {
  try {
    const records = await Usage.find().sort({ date: 1 }).select('date units cost anomaly');
    const { ok, data } = await callPython('/recommendations', { records });
    if (!ok) return res.json({ recommendations: [], avgMonthlyUnits: 0 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/usage/export  — streams CSV
exports.exportCSV = async (req, res) => {
  try {
    const filter = {};
    if (req.query.from || req.query.to) {
      filter.date = {};
      if (req.query.from) filter.date.$gte = new Date(req.query.from);
      if (req.query.to) filter.date.$lte = new Date(req.query.to);
    }

    const records = await Usage.find(filter).sort({ date: -1 });
    const header = 'date,units,cost,source,anomaly,anomalyScore,peakHour\n';
    const rows = records
      .map((r) =>
        [
          new Date(r.date).toISOString().split('T')[0],
          r.units, r.cost, r.source,
          r.anomaly, r.anomalyScore, r.peakHour,
        ].join(',')
      )
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="electricity-report.csv"');
    res.send(header + rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/usage
exports.create = async (req, res) => {
  try {
    let { date, units, cost, source, hour } = req.body;
    
    // Strict numeric casting for manual entries
    units = Number(units);
    cost = Number(cost);

    // Enrich with Python AI (Anchored Intelligence)
    // We only send the new record; app.py anchors the baseline to 8-25 kWh urban standard.
    const { ok, data } = await callPython('/process', { records: [{ date, units, cost, source, hour }] });
    
    let finalData = { date, units, cost, source, hour };
    if (ok && data.records && data.records.length > 0) {
      const enriched = data.records[0];
      finalData.anomaly = enriched.anomaly;
      finalData.anomalyScore = enriched.anomalyScore;
      finalData.peakHour = enriched.peakHour;
      
      console.log(`🛡️ Bharat Intelligence Verdict [${units} kWh]:`, {
        anomaly: finalData.anomaly,
        score: finalData.anomalyScore,
        baseline: data.baseline
      });
    }

    const record = await Usage.create(finalData);
    
    // Async check for sentinels
    checkSentinels(record);

    res.status(201).json(record);
  } catch (err) {
    console.error('Manual Entry Error:', err.message);
    res.status(400).json({ error: err.message });
  }
};

// POST /api/usage/upload
exports.uploadCSV = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const rows = parseCSV(req.file.buffer);
    if (rows.length === 0) return res.status(400).json({ error: 'CSV has no valid rows' });

    // Call Python for enrichment
    const { ok, data: pyData } = await callPython('/process', { records: rows });

    let enrichedRows = rows;
    let anomalyCount = 0;
    let trend = null;

    if (ok && pyData?.records) {
      enrichedRows = pyData.records.map((r) => ({
        date: r.date,
        units: r.units,
        cost: r.cost,
        source: r.source || 'CSV',
        hour: r.hour || null,
        peakHour: r.peakHour || false,
        anomaly: r.anomaly || false,
        anomalyScore: r.anomalyScore || 0,
      }));
      anomalyCount = pyData.anomalyCount || 0;
      trend = pyData.trend || null;
    }

    const inserted = await Usage.insertMany(enrichedRows, { ordered: false });
    
    // Trigger sentinel checks for insertions with anomalies or high breaches
    // To avoid overloading, we check records that are either anomalies or high-consumption
    inserted.forEach(record => {
      if (record.anomaly || record.units > 100) { // Threshold for auto-scanning bulk uploads
        checkSentinels(record);
      }
    });

    res.status(201).json({ 
      inserted: inserted.length, 
      anomalyCount, 
      trend, 
      baseline: pyData?.baseline || 12.0 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/usage/:id
exports.remove = async (req, res) => {
  try {
    await Usage.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
