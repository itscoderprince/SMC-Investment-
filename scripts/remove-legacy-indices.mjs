
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Load env vars manually
const envPath = path.join(rootDir, '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not defined in .env.local');
    process.exit(1);
}

const legacyNames = [
    "Sovereign Core",
    "Alpha Venture",
    "Tactical Commodity",
    "Yield Optimizer"
];

async function removeLegacy() {
    try {
        console.log('Connecting to MongoDB...');
        // Match app connection options
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            family: 4
        };

        await mongoose.connect(process.env.MONGODB_URI, opts);
        console.log('Connected to MongoDB.');

        // Define minimal schema to access collection
        const indexSchema = new mongoose.Schema({ name: String }, { strict: false });
        // Use existing model or compile new one
        const Index = mongoose.models.Index || mongoose.model('Index', indexSchema);

        console.log(`Removing legacy indices: ${legacyNames.join(', ')}`);

        const result = await Index.deleteMany({
            name: { $in: legacyNames }
        });

        console.log(`Deleted ${result.deletedCount} legacy indices.`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Cleanup failed with error:');
        console.error(error);
        process.exit(1);
    }
}

removeLegacy();
