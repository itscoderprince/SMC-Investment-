import connectDB from '@/lib/db';
import Investment from '@/models/Investment';
import { requireAuth } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/response';

export async function GET(request) {
    try {
        await connectDB();

        const auth = await requireAuth(request);
        if (!auth.success) {
            return auth.response;
        }

        const { user } = auth;

        // Get all active investments
        const investments = await Investment.find({ userId: user._id, isActive: true })
            .populate('indexId', 'name currentReturnRate')
            .select('amount totalReturns weeklyReturns indexId activatedAt')
            .lean();

        // Calculate expected weeky returns
        let totalExpectedWeekly = 0;
        const breakdown = [];

        for (const inv of investments) {
            const returnRate = inv.indexId?.currentReturnRate || 4;
            const expectedReturn = (inv.amount * returnRate) / 100;
            totalExpectedWeekly += expectedReturn;

            breakdown.push({
                investmentId: inv._id,
                indexName: inv.indexId?.name || 'Unknown',
                principal: inv.amount,
                returnRate,
                expectedWeeklyReturn: expectedReturn
            });
        }

        // Get last return date
        let lastReturnDate = null;
        for (const inv of investments) {
            if (inv.weeklyReturns.length > 0) {
                const lastReturn = inv.weeklyReturns[inv.weeklyReturns.length - 1];
                if (!lastReturnDate || new Date(lastReturn.creditedAt) > new Date(lastReturnDate)) {
                    lastReturnDate = lastReturn.creditedAt;
                }
            }
        }

        return successResponse({
            totalExpectedWeeklyReturns: totalExpectedWeekly,
            lastReturnDate,
            breakdown,
            activeInvestments: investments.length
        }, 'Expected returns calculated');

    } catch (error) {
        console.error('Get expected returns error:', error);
        return errorResponse('Failed to calculate expected returns', 500, error.message);
    }
}
