
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Index from '@/models/Index';

const indicesToSeed = [
    {
        name: "Bratsk",
        description: "Baseline volatility protection using bank-to-bank settlement proofs and premium debt instruments.",
        currentReturnRate: 4.25,
        icon: "Shield",
        riskLevel: "low",
        category: "finance",
        minInvestment: 100,
        color: "#3b82f6"
    },
    {
        name: "Eyik",
        description: "Aggressive growth mapping across emerging fintech indices and high-frequency settlement pools.",
        currentReturnRate: 14.80,
        icon: "BarChart3",
        riskLevel: "high",
        category: "technology",
        minInvestment: 1000,
        color: "#10b981"
    },
    {
        name: "Viliuisk",
        description: "Direct tracking of physical commodities using off-chain verification and audited storage logs.",
        currentReturnRate: 7.12,
        icon: "Activity",
        riskLevel: "medium",
        category: "energy",
        minInvestment: 500,
        color: "#f59e0b"
    },
    {
        name: "Kobyai",
        description: "Balanced algorithmic rebalancing across multiple indices to maximize consistent weekly dividends.",
        currentReturnRate: 6.40,
        icon: "PieChart",
        riskLevel: "medium",
        category: "other",
        minInvestment: 250,
        color: "#8b5cf6"
    }
];

export async function GET() {
    try {
        await connectDB();
        const results = [];

        for (const data of indicesToSeed) {
            const exists = await Index.findOne({
                $or: [{ name: data.name }, { slug: data.name.toLowerCase() }]
            });

            if (exists) {
                results.push(`Skipped ${data.name} (exists)`);
            } else {
                await Index.create(data);
                results.push(`Created ${data.name}`);
            }
        }

        return NextResponse.json({ success: true, results });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
