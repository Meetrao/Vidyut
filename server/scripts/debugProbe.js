const mongoose = require('mongoose');
const axios = require('axios');
const Usage = require('../models/Usage');
require('dotenv').config({ path: '../.env' });

const PYTHON_URL = process.env.PYTHON_URL || 'http://localhost:5001';

async function debugProbe() {
    console.log('🛡️ Starting Final Intelligence Probe [Breach Ratio Standard]...');
    
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart-electricity-dashboard');
        console.log('✅ Connected to MongoDB.');

        const manualEntry = {
            date: new Date(),
            units: 140,
            cost: 1400,
            source: 'Manual'
        };

        console.log('📡 Pulsing Bharat AI Core [Port 5001]...');
        const res = await axios.post(`${PYTHON_URL}/process`, { records: [manualEntry] });
        
        console.log('📥 Python Response Received:', JSON.stringify(res.data, null, 2));

        if (res.data.records && res.data.records.length > 0) {
            const enriched = res.data.records[0];
            console.log('💎 Enrichment Payload:', {
                anomaly: enriched.anomaly,
                ratio: enriched.breachRatio
            });
            
            manualEntry.anomaly = enriched.anomaly;
            manualEntry.breachRatio = enriched.breachRatio;
        }

        console.log('💾 Saving to Database...');
        const result = await Usage.create(manualEntry);
        console.log('✅ Final Saved Record (Rectified):', JSON.stringify(result, null, 2));

    } catch (err) {
        console.error('❌ Probe Failed:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('🏁 Probe Concluded.');
    }
}

debugProbe();
