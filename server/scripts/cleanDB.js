const mongoose = require('mongoose');
require('dotenv').config();

const Usage = require('../models/Usage');
const Notification = require('../models/Notification');

async function cleanDB() {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) throw new Error('MONGO_URI not found in environment');

    await mongoose.connect(MONGO_URI);
    console.log('📡 Connected to MongoDB for maintenance...');

    const resUsage = await Usage.deleteMany({});
    console.log(`🗑️ Deleted ${resUsage.deletedCount} usage records.`);

    const resNotif = await Notification.deleteMany({});
    console.log(`🗑️ Deleted ${resNotif.deletedCount} notifications.`);

    console.log('✅ Database is now clean and ready for real-time data.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error cleaning database:', err.message);
    process.exit(1);
  }
}

cleanDB();
