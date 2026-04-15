const mongoose = require('mongoose');

const usageSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  units: { type: Number, required: true },
  cost: { type: Number, required: true },
  source: { type: String, default: 'CSV' },
  hour: { type: Number, default: null },       // 0-23 if hourly data
  peakHour: { type: Boolean, default: false },  // populated by Python service
  anomaly: { type: Boolean, default: false },   // Multiplicative breach flag (2.5x+)
  breachRatio: { type: Number, default: 0 },   // Ratio to Baseline (e.g., 5.6 = 5.6x baseline)
}, { timestamps: true });

const Usage = mongoose.model('Usage', usageSchema);
module.exports = Usage;
