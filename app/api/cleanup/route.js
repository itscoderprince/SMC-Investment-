
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Index from '@/models/Index';

const legacyNames = [
    "Sovereign Core",
    "Alpha Venture",
    "Tactical Commodity",
    "Yield Optimizer"
];

export async function GET() {
    try {
        await connectDB();

        console.log(`Removing legacy indices: ${legacyNames.join(', ')}`);

        const result = await Index.deleteMany({
            name: { $in: legacyNames }
        });

        return NextResponse.json({
            success: true,
            deletedCount: result.deletedCount,
            message: `Deleted ${result.deletedCount} legacy indices.`
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
