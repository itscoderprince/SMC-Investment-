// Seed Investment Indices Script
// Run with: node --env-file=.env.local scripts/seed-indices.mjs

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI not found in environment variables');
    console.error('Run with: node --env-file=.env.local scripts/seed-indices.mjs');
    process.exit(1);
}

// Define Index schema inline
const indexSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true, trim: true },
        slug: { type: String, lowercase: true },
        description: { type: String, required: true },
        shortDescription: { type: String },
        minInvestment: { type: Number, required: true },
        maxInvestment: { type: Number, default: 1000000 },
        currentReturnRate: { type: Number, default: 4 },
        category: { type: String, required: true, enum: ['technology', 'healthcare', 'finance', 'energy', 'other'] },
        riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
        isActive: { type: Boolean, default: true },
        totalInvested: { type: Number, default: 0 },
        activeInvestors: { type: Number, default: 0 },
        totalReturnsDistributed: { type: Number, default: 0 },
        features: { type: [String], default: [] },
        icon: { type: String, default: 'TrendingUp' },
        color: { type: String, default: '#2563eb' },
        sortOrder: { type: Number, default: 0 }
    },
    { timestamps: true }
);

// Auto-generate slug before saving
indexSchema.pre('save', function () {
    if (this.isModified('name') && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    if (this.isModified('description') && !this.shortDescription) {
        this.shortDescription = this.description.substring(0, 150) + (this.description.length > 150 ? '...' : '');
    }
});

const Index = mongoose.models.Index || mongoose.model('Index', indexSchema);

// Sample indices data
const sampleIndices = [
    {
        name: 'Sovereign Core',
        description: 'Baseline volatility protection using bank-to-bank settlement proofs and premium debt instruments. This index focuses on long-term stability and wealth preservation.',
        name: "Bratsk",
        description: "Baseline volatility protection using bank-to-bank settlement proofs and premium debt instruments.",
        currentReturnRate: 4.25,
        icon: "Shield",
        riskLevel: "low",
        category: "finance",
        minInvestment: 100,
        lockPeriod: "3 Years",
        color: "#3b82f6"
    },
    {
        name: "Eyik",
        description: "Aggressive growth mapping across emerging fintech nodes and high-frequency settlement pools.",
        currentReturnRate: 14.80,
        icon: "BarChart3",
        riskLevel: "high",
        category: "technology",
        minInvestment: 1000,
        lockPeriod: "2 Years",
        color: "#10b981"
    },
    {
        name: "Viliuisk",
        description: "Direct tracking of physical commodities using off-chain verification and audited storage logs.",
        currentReturnRate: 7.12,
        icon: "Activity",
        riskLevel: "medium",
        category: "energy",
        minInvestment: 4999,
        lockPeriod: "1 Year",
        color: "#f59e0b"
    },
    {
        name: "Kobyai",
        description: "Balanced algorithmic rebalancing across multiple indices to maximize consistent weekly dividends.",
        currentReturnRate: 6.40,
        icon: "PieChart",
        riskLevel: "medium",
        category: "other",
        minInvestment: 2499,
        lockPeriod: "1 Year",
        color: "#8b5cf6"
    }
];

async function seedIndices() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected successfully!\n');

        console.log('Seeding investment indices...\n');

        for (const indexData of sampleIndices) {
            try {
                const existing = await Index.findOne({ name: indexData.name });

                if (existing) {
                    console.log(`✓ Index "${indexData.name}" already exists (slug: ${existing.slug})`);
                } else {
                    const newIndex = new Index(indexData);
                    await newIndex.save();
                    console.log(`✓ Created index: "${newIndex.name}" (slug: ${newIndex.slug})`);
                }
            } catch (err) {
                if (err.code === 11000) {
                    console.log(`⚠ Index "${indexData.name}" already exists`);
                } else {
                    console.error(`✗ Failed to create "${indexData.name}":`, err.message);
                }
            }
        }

        console.log('\n--- Summary ---');
        const allIndices = await Index.find({ isActive: true });
        console.log(`Total active indices: ${allIndices.length}`);
        allIndices.forEach(idx => {
            console.log(`  • ${idx.name} (${idx.slug}) - ${idx.currentReturnRate}% weekly`);
        });

        console.log('\nSeeding completed!');
        console.log('\nYou can now visit:');
        allIndices.forEach(idx => {
            console.log(`  http://localhost:3000/indices/${idx.slug}`);
        });

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

seedIndices();
