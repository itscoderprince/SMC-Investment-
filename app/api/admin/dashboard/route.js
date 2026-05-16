import connectDB from '@/lib/db';
import { requireAdmin } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/response';
import User from '@/models/User';
import Investment from '@/models/Investment';
import PaymentRequest from '@/models/PaymentRequest';
import Withdrawal from '@/models/Withdrawal';
import Ticket from '@/models/Ticket';
import KYC from '@/models/KYC';
import Index from '@/models/Index';
import ActivityLog from '@/models/ActivityLog';

export async function GET(request) {
    try {
        await connectDB();

        const auth = await requireAdmin(request);
        if (!auth.success) {
            return auth.response;
        }

        // Get overview stats
        const [
            totalUsers,
            activeUsers,
            pendingKYC,
            pendingPayments,
            pendingWithdrawals,
            openTickets,
            totalIndices,
            investmentStats,
            recentUsers,
            recentActivities,
            activeUsersLastMonth,
            investmentStatsLastMonth,
            returnsStatsLastMonth,
            indexDistribution,
            userGrowth
        ] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            User.countDocuments({ role: 'user', isActive: true }),
            KYC.countDocuments({ status: 'pending' }),
            PaymentRequest.countDocuments({ status: 'proof_uploaded' }),
            Withdrawal.countDocuments({ status: 'pending' }),
            Ticket.countDocuments({ status: { $in: ['open', 'in-progress'] } }),
            Index.countDocuments({}),
            Investment.aggregate([
                { $match: { isActive: true } },
                {
                    $group: {
                        _id: null,
                        totalInvested: { $sum: '$amount' },
                        totalReturns: { $sum: '$totalReturns' },
                        count: { $sum: 1 }
                    }
                }
            ]),
            User.find({ role: 'user' })
                .select('name email kycStatus createdAt')
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),
            ActivityLog.find({})
                .populate('userId', 'name email')
                .sort({ createdAt: -1 })
                .limit(10)
                .lean(),
            // Trend data (30 days ago)
            User.countDocuments({ role: 'user', createdAt: { $lte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
            Investment.aggregate([
                { $match: { isActive: true, createdAt: { $lte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
                {
                    $group: {
                        _id: null,
                        totalInvested: { $sum: '$amount' }
                    }
                }
            ]),
            // Helper for total returns 30 days ago
            Investment.aggregate([
                { $unwind: '$weeklyReturns' },
                { $match: { 'weeklyReturns.creditedAt': { $lte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
                {
                    $group: {
                        _id: null,
                        totalReturnsDistributed: { $sum: '$weeklyReturns.returnAmount' }
                    }
                }
            ]),
            Investment.aggregate([
                { $match: { isActive: true } },
                {
                    $group: {
                        _id: '$indexId',
                        totalAmount: { $sum: '$amount' }
                    }
                },
                {
                    $lookup: {
                        from: 'indices',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'indexInfo'
                    }
                },
                { $unwind: '$indexInfo' },
                {
                    $project: {
                        name: '$indexInfo.name',
                        value: '$totalAmount',
                        color: '$indexInfo.color'
                    }
                }
            ]),
            User.aggregate([
                { $match: { role: 'user', createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 5, 1)) } } },
                {
                    $group: {
                        _id: {
                            month: { $month: '$createdAt' },
                            year: { $year: '$createdAt' }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ])
        ]);

        const stats = investmentStats[0] || { totalInvested: 0, totalReturns: 0, count: 0 };
        const usersLastMonth = activeUsersLastMonth || 0;
        const investedLastMonth = investmentStatsLastMonth[0]?.totalInvested || 0;
        const returnsLastMonth = returnsStatsLastMonth[0]?.totalReturnsDistributed || 0;

        // Calculate trends
        const calculateTrend = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return ((current - previous) / previous) * 100;
        };

        const userTrend = calculateTrend(totalUsers, usersLastMonth);
        const investmentTrend = calculateTrend(stats.totalInvested, investedLastMonth);
        const returnsTrend = calculateTrend(stats.totalReturns, returnsLastMonth);


        // Calculate distribution percentages
        const totalAmount = indexDistribution.reduce((acc, curr) => acc + curr.value, 0);
        const distribution = indexDistribution.map(item => ({
            name: item.name,
            value: totalAmount > 0 ? Math.round((item.value / totalAmount) * 100) : 0,
            color: item.color || '#2563eb'
        }));

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const growthData = [];
        for (let i = 0; i < 6; i++) {
            const d = new Date();
            d.setMonth(d.getMonth() - (5 - i));
            const m = d.getMonth() + 1;
            const y = d.getFullYear();
            const found = userGrowth.find(g => g._id.month === m && g._id.year === y);
            growthData.push({
                month: months[m - 1],
                users: found ? found.count : 0
            });
        }

        return successResponse({
            overview: {
                totalUsers,
                activeUsers,
                activeInvestments: stats.count,
                totalInvested: stats.totalInvested,
                totalReturns: stats.totalReturns
            },
            pending: {
                kyc: pendingKYC,
                payments: pendingPayments,
                withdrawals: pendingWithdrawals,
                tickets: openTickets
            },
            indices: {
                total: totalIndices
            },
            distribution: distribution,
            growth: growthData,
            recentUsers: recentUsers.map(u => ({
                id: u._id,
                name: u.name,
                email: u.email,
                kycStatus: u.kycStatus,
                createdAt: u.createdAt
            })),
            activities: recentActivities.map(a => ({
                id: a._id,
                user: a.userId?.name || 'Unknown',
                email: a.userId?.email || '',
                action: a.action,
                description: a.description,
                status: a.status,
                createdAt: a.createdAt,
                metadata: a.metadata || {} // Include metadata for dynamic amount/details
            })),
            trends: {
                users: {
                    value: Math.round(userTrend),
                    isPositive: userTrend >= 0
                },
                investments: {
                    value: Math.round(investmentTrend),
                    isPositive: investmentTrend >= 0
                },
                returns: {
                    value: Math.round(returnsTrend),
                    isPositive: returnsTrend >= 0
                }
            },
            chartConfig: distribution.reduce((acc, curr) => {
                const key = curr.name.toLowerCase().replace(/\s+/g, '_');
                acc[key] = {
                    label: curr.name,
                    color: curr.color
                };
                return acc;
            }, { value: { label: "Percentage" } })
        }, 'Dashboard data retrieved');

    } catch (error) {
        console.error('Admin dashboard error:', error);
        return errorResponse('Failed to get dashboard data', 500, error.message);
    }
}
