import connectDB from '@/lib/db';
import User from '@/models/User';
import Investment from '@/models/Investment';
import { successResponse, errorResponse } from '@/lib/response';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();

        const [totalUsers, investmentStats] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            Investment.aggregate([
                { $match: { isActive: true } },
                {
                    $group: {
                        _id: null,
                        totalInvested: { $sum: '$amount' },
                        count: { $sum: 1 }
                    }
                }
            ])
        ]);

        const stats = investmentStats[0] || { totalInvested: 0, count: 0 };

        return successResponse({
            totalUsers,
            totalInvested: stats.totalInvested,
            activeInvestments: stats.count
        }, 'Public stats retrieved');

    } catch (error) {
        console.error('Public stats error:', error);
        return errorResponse('Failed to get stats', 500, error.message);
    }
}
