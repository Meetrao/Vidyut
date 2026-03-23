const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['cost', 'units'], required: true },
    threshold: { type: Number, required: true },
  },
  { timestamps: true }
);

const Alert = mongoose.model('Alert', alertSchema);
module.exports = Alert;
