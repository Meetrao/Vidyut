const Usage = require('../models/Usage');
const { parseCSV } = require('../services/csvParser');
const axios = require('axios');

const PYTHON_URL = process.env.PYTHON_URL || 'http://localhost:5001';

// ── helpers ──────────────────────────────────────────────────────────────────

async function callPython(endpoint, payload) {
  try {
    const res = await axios.post(`${PYTHON_URL}${endpoint}`, payload, { timeout: 15000 });
    return { ok: true, data: res.data };
  } catch {
    return { ok: false, data: null };
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
    res.json({ ...stats, monthly });
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
    const { date, units, cost, source, hour } = req.body;
    const record = await Usage.create({ date, units, cost, source, hour });
    res.status(201).json(record);
  } catch (err) {
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
    res.status(201).json({ inserted: inserted.length, anomalyCount, trend });
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
