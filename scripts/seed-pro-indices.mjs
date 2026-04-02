// Seed specific Pro Indices
// Run with: node --env-file=.env.local scripts/seed-pro-indices.mjs

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI not found in environment variables');
    process.exit(1);
}

const indexSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true, trim: true },
        slug: { type: String, lowercase: true },
        description: { type: String, required: true },
        shortDescription: { type: String },
        minInvestment: { type: Number, required: true },
        maxInvestment: { type: Number, default: 1000000 },
        currentReturnRate: { type: Number, default: 4 },
        category: { type: String, required: true },
        riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
        isActive: { type: Boolean, default: true },
        icon: { type: String, default: 'TrendingUp' },
        color: { type: String, default: '#2563eb' },
        sortOrder: { type: Number, default: 0 }
    },
    { timestamps: true }
);

const Index = mongoose.models.Index || mongoose.model('Index', indexSchema);

const proIndices = [
    {
        name: 'Bratsk',
        slug: 'bratsk',
        description: 'Baseline volatility protection using bank-to-bank settlement proofs and premium debt instruments.',
        minInvestment: 5000,
        currentReturnRate: 4.25,
        category: 'finance',
        riskLevel: 'low',
        icon: 'Shield',
        color: '#3b82f6'
    },
    {
        name: 'Eyik',
        slug: 'eyik',
        description: 'Aggressive growth mapping across emerging fintech nodes and high-frequency settlement pools.',
        minInvestment: 15000,
        currentReturnRate: 14.80,
        category: 'technology',
        riskLevel: 'high',
        icon: 'BarChart3',
        color: '#10b981'
    },
    {
        name: 'Viliuisk',
        slug: 'viliuisk',
        description: 'Direct tracking of physical commodities using off-chain verification and audited storage logs.',
        minInvestment: 10000,
        currentReturnRate: 7.12,
        category: 'other',
        riskLevel: 'medium',
        icon: 'Activity',
        color: '#f59e0b'
    },
    {
        name: 'Kobyai',
        slug: 'kobyai',
        description: 'Balanced algorithmic rebalancing across multiple indices to maximize consistent weekly dividends.',
        minInvestment: 7500,
        currentReturnRate: 6.40,
        category: 'finance',
        riskLevel: 'medium',
        icon: 'PieChart',
        color: '#8b5cf6'
    }
];

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        for (const data of proIndices) {
            await Index.findOneAndUpdate(
                { slug: data.slug },
                data,
                { upsert: true, new: true }
            );
            console.log(`Seeded/Updated: ${data.name}`);
        }

        console.log('Seeding finished');
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
