import connectDB from '@/lib/db';
import { requireAuth } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/response';
import KYC from '@/models/KYC';
import Investment from '@/models/Investment';

export async function GET(request) {
    try {
        await connectDB();

        // Authenticate user
        const auth = await requireAuth(request);
        if (!auth.success) {
            return auth.response;
        }

        const { user } = auth;

        // Get additional user data
        const kyc = await KYC.findOne({ userId: user._id }).select('status');
        const investmentSummary = await Investment.getUserTotalInvestment(user._id);

        // [SELF-HEALING] Sync KYC status if desynced
        let currentKycStatus = user.kycStatus;
        if (kyc && kyc.status === 'approved' && user.kycStatus !== 'approved') {
            console.log(`🔧 Self-healing: Repairing KYC status for user ${user.email}`);
            const User = (await import('@/models/User')).default;
            await User.findByIdAndUpdate(user._id, { kycStatus: 'approved' });
            currentKycStatus = 'approved';
        }

        // [SELF-HEALING] Ensure referral code exists
        let referralCode = user.referralCode;
        if (!referralCode) {
            const crypto = require('crypto');
            const namePart = (user.name || 'USR').replace(/\s+/g, '').substring(0, 4).toUpperCase();
            const randPart = crypto.randomBytes(3).toString('hex').toUpperCase();
            referralCode = `${namePart}${randPart}`;
            const User = (await import('@/models/User')).default;
            await User.findByIdAndUpdate(user._id, { referralCode });
        }

        return successResponse({
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                role: user.role,
                kycStatus: currentKycStatus,
                isEmailVerified: user.isEmailVerified,
                isActive: user.isActive,
                avatar: user.avatar,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin,
                bankDetails: user.bankDetails,
                referralCode,
                referralBonusEarned: user.referralBonusEarned,
                kyc: kyc ? { status: kyc.status } : null,

                investments: {
                    totalInvested: investmentSummary.total,
                    totalReturns: investmentSummary.totalReturns
                }
            }
        }, 'Profile retrieved successfully');

    } catch (error) {
        console.error('Get profile error:', error);
        return errorResponse('Failed to get profile', 500, error.message);
    }
}
