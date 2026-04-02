import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple .env.local parser
const loadEnv = () => {
    const envPath = path.resolve(__dirname, '../.env.local');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
            if (match) {
                const key = match[1];
                let value = match[2] || '';
                if (value.length > 0 && value.startsWith('"') && value.endsWith('"')) {
                    value = value.substring(1, value.length - 1);
                }
                process.env[key] = value;
            }
        });
        console.log('📝 Loaded environment variables from .env.local');
    }
};

loadEnv();

import User from '../models/User.js';
import Index from '../models/Index.js';
import PlatformSettings from '../models/PlatformSettings.js';
import ActivityLog from '../models/ActivityLog.js';
import Ticket from '../models/Ticket.js';
import Investment from '../models/Investment.js';
import PaymentRequest from '../models/PaymentRequest.js';
import Withdrawal from '../models/Withdrawal.js';
import KYC from '../models/KYC.js';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env.local');
    process.exit(1);
}

const clearData = async () => {
    try {
        console.log('⏳ Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        console.log('🧹 Clearing all data models...');

        const models = [
            User,
            Index,
            PlatformSettings,
            ActivityLog,
            Ticket,
            Investment,
            PaymentRequest,
            Withdrawal,
            KYC
        ];

        for (const model of models) {
            console.log(`   - Clearing ${model.modelName}...`);
            await model.deleteMany({});
        }

        // Re-initialize platform settings defaults
        console.log('⚙️ Re-initializing Platform Settings defaults...');
        await PlatformSettings.initDefaults();

        console.log('✨ Data cleanup completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Cleanup failed:', error);
        process.exit(1);
    }
};

clearData();
