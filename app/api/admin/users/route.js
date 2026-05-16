import connectDB from '@/lib/db';
import User from '@/models/User';
import Investment from '@/models/Investment';
import { requireAdmin } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/response';
import { parsePagination } from '@/lib/validation';

export async function GET(request) {
    try {
        await connectDB();

        const auth = await requireAdmin(request);
        if (!auth.success) {
            return auth.response;
        }

        const { searchParams } = new URL(request.url);
        const pagination = parsePagination(searchParams);
        const search = searchParams.get('search');
        const kycStatus = searchParams.get('kycStatus');
        const isActive = searchParams.get('isActive');

        // Build query
        const query = {};

        // If not master_admin, only see users
        if (auth.user.role !== 'master_admin') {
            query.role = 'user';
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        if (kycStatus && kycStatus !== 'all') {
            query.kycStatus = kycStatus;
        }

        if (isActive === 'true') {
            query.isActive = true;
        } else if (isActive === 'false') {
            query.isActive = false;
        }

        // Get users, totals, and global stats concurrently
        const globalQuery = {};
        if (auth.user.role !== 'master_admin') {
            globalQuery.role = 'user';
        }

        const [
            total,
            kycVerifiedTotal,
            blockedTotal,
            globalActiveInvestorIds,
            users
        ] = await Promise.all([
            User.countDocuments(query),
            User.countDocuments({ ...globalQuery, kycStatus: 'approved' }),
            User.countDocuments({ ...globalQuery, isActive: false }),
            Investment.distinct('userId', { isActive: true }),
            User.find(query)
                .select('-password -refreshToken')
                .sort({ createdAt: -1 })
                .skip((pagination.page - 1) * pagination.limit)
                .limit(pagination.limit)
                .lean()
        ]);

        // Get investments for users (batch fetch to fix N+1 problem)
        const userIds = users.map(u => u._id);
        const allInvestments = await Investment.find({ userId: { $in: userIds }, isActive: true }).lean();

        const userStats = users.map(user => {
            const userInvestments = allInvestments.filter(inv => String(inv.userId) === String(user._id));
            const totalInvested = userInvestments.reduce((sum, inv) => sum + inv.amount, 0);
            return {
                id: user._id,
                _id: user._id, // Keep both for compatibility
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                kycStatus: user.kycStatus,
                isActive: user.isActive,
                isEmailVerified: user.isEmailVerified,
                lastLogin: user.lastLogin,
                createdAt: user.createdAt,
                totalInvested,
                accumulationBonus: user.accumulationBonus || 0,
                activeInvestments: userInvestments.length
            };
        });

        return successResponse({
            users: userStats,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                pages: Math.ceil(total / pagination.limit),
                kycVerifiedTotal,
                blockedTotal,
                activeInvestorsTotal: globalActiveInvestorIds.length
            }
        }, 'Users retrieved');

    } catch (error) {
        console.error('Admin get users error:', error);
        return errorResponse('Failed to get users', 500, error.message);
    }
}
