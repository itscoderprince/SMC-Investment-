import connectDB from '@/lib/db';
import Investment from '@/models/Investment';
import { requireAuth } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/response';

// GET - Get active investments only
export async function GET(request) {
    try {
        await connectDB();

        const auth = await requireAuth(request);
        if (!auth.success) {
            return auth.response;
        }

        const { user } = auth;

        // Get active investments
        const investments = await Investment.find({
            userId: user._id,
            isActive: true
        })
            .populate('indexId', 'name slug color currentReturnRate')
            .sort({ activatedAt: -1 })
            .lean();

        // Calculate totals
        const totals = investments.reduce((acc, inv) => ({
            totalInvested: acc.totalInvested + inv.amount,
            totalReturns: acc.totalReturns + inv.totalReturns
        }), { totalInvested: 0, totalReturns: 0 });

        return successResponse({
            investments: investments.map(inv => ({
                id: inv._id,
                amount: inv.amount,
                totalReturns: inv.totalReturns,
                totalValue: inv.amount + inv.totalReturns,
                activatedAt: inv.activatedAt,
                index: inv.indexId ? {
                    id: inv.indexId._id,
                    name: inv.indexId.name,
                    slug: inv.indexId.slug,
                    color: inv.indexId.color,
                    currentReturnRate: inv.indexId.currentReturnRate
                } : null
            })),
            summary: {
                count: investments.length,
                totalInvested: totals.totalInvested,
                totalReturns: totals.totalReturns,
                totalValue: totals.totalInvested + totals.totalReturns
            }
        }, 'Active investments retrieved');

    } catch (error) {
        console.error('Get active investments error:', error);
        return errorResponse('Failed to get active investments', 500, error.message);
    }
}
