import connectDB from '@/lib/db';
import { requireAuth } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/response';
import Investment from '@/models/Investment';
import PaymentRequest from '@/models/PaymentRequest';
import Withdrawal from '@/models/Withdrawal';
import Ticket from '@/models/Ticket';
import KYC from '@/models/KYC';
import Index from '@/models/Index'; // required for populate('indexId')


export async function GET(request) {
    try {
        console.log('Dashboard API hit');

        await connectDB();

        const auth = await requireAuth(request);
        if (!auth.success) {
            console.log('Auth failed:', auth);
            return auth.response;
        }

        const { user } = auth;
        const userId = user._id;

        // Fetch all independent dashboard data concurrently
        const [
            investmentSummary,
            activeInvestments,
            totalLifetimeReturns,
            totalWithdrawn,
            totalLifetimePrincipal,
            pendingPayments,
            pendingWithdrawals,
            openTickets,
            kyc,
            recentInvestments,
            chartData
        ] = await Promise.all([
            Investment.getUserTotalInvestment(userId),
            Investment.countDocuments({ userId, isActive: true }),
            Investment.getUserTotalReturns(userId),
            Withdrawal.getUserTotalWithdrawn(userId),
            Investment.getUserTotalPrincipal(userId),
            PaymentRequest.countDocuments({ userId, status: { $in: ['pending', 'proof_uploaded'] } }),
            Withdrawal.countDocuments({ userId, status: 'pending' }),
            Ticket.countDocuments({ userId, status: { $in: ['open', 'in-progress'] } }),
            KYC.findOne({ userId }).select('status submittedAt').lean(),
            Investment.find({ userId, isActive: true })
                .populate('indexId', 'name slug color riskLevel')
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),
            Investment.aggregate([
                { $match: { userId: userId, 'weeklyReturns.0': { $exists: true } } },
                { $unwind: '$weeklyReturns' },
                {
                    $group: {
                        _id: { $week: '$weeklyReturns.creditedAt' },
                        total: { $sum: '$weeklyReturns.returnAmount' },
                        date: { $first: '$weeklyReturns.creditedAt' }
                    }
                },
                { $sort: { '_id': 1 } },
                { $limit: 12 },
                {
                    $project: {
                        _id: 0,
                        week: { $concat: ['W', { $toString: '$_id' }] },
                        value: '$total'
                    }
                }
            ])
        ]);

        // Calculate available balance (lifetime returns + referral bonus + accumulation bonus - lifetime withdrawals)
        const bonus = user.accumulationBonus || 0;
        const referralBonus = user.referralBonusEarned || 0;
        const availableBalance = totalLifetimeReturns + bonus + referralBonus - totalWithdrawn;

        // [SELF-HEALING] Ensure referral code exists
        let referralCode = user.referralCode;
        if (!referralCode) {
            const crypto = require('crypto');
            const namePart = (user.name || 'USR').replace(/\s+/g, '').substring(0, 4).toUpperCase();
            const randPart = crypto.randomBytes(3).toString('hex').toUpperCase();
            referralCode = `${namePart}${randPart}`;
            const User = (await import('@/models/User')).default;
            await User.findByIdAndUpdate(userId, { referralCode });
        }

        return successResponse({
            user: {
                name: user.name,
                email: user.email,
                kycStatus: user.kycStatus,
                isEmailVerified: user.isEmailVerified,
                referralCode,
                referralBonusEarned: referralBonus
            },
            summary: {
                totalInvested: investmentSummary.total,
                totalLifetimeInvested: totalLifetimePrincipal,
                totalReturns: totalLifetimeReturns,
                currentValue: investmentSummary.total + investmentSummary.totalReturns,
                walletBalance: Math.max(0, availableBalance),
                totalWithdrawn: totalWithdrawn,
                accumulationBonus: user.accumulationBonus || 0,
                referralBonusEarned: referralBonus,
                activeInvestmentsCount: activeInvestments
            },

            pendingItems: {
                payments: pendingPayments,
                withdrawals: pendingWithdrawals,
                tickets: openTickets
            },
            kyc: kyc ? {
                status: kyc.status,
                submittedAt: kyc.submittedAt
            } : null,
            recentInvestments: recentInvestments.map(inv => ({
                _id: inv._id,
                amount: inv.amount,
                totalReturns: inv.totalReturns,
                index: inv.indexId,
                status: inv.status,
                activatedAt: inv.activatedAt
            })),
            chartData: chartData
        }, 'Dashboard data retrieved');


    } catch (error) {
        console.error('Dashboard error:', error);
        return errorResponse('Failed to get dashboard data', 500, error.message);
    }
}
