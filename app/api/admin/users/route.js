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

        // Get total count
        const total = await User.countDocuments(query);

        // Get stats
        const [totalVerified, totalBlocked, activeInvestorIds] = await Promise.all([
            User.countDocuments({ ...query, kycStatus: 'approved' }), // Apply query to filter by search/role if needed, but stats usually cover all
            User.countDocuments({ ...query, isActive: false }),
            Investment.distinct('userId', { isActive: true })
        ]);

        // If the query has specific filters (like search), the global stats might need to respect that or be global. 
        // Typically dashboard stats are global or scoped to the current view. 
        // Given the UI layout, these look like global stats for the "Users Management" section.
        // So I will calculate them globally (respecting the role filter if not master_admin).

        const globalQuery = {};
        if (auth.user.role !== 'master_admin') {
            globalQuery.role = 'user';
        }

        const [kycVerifiedTotal, blockedTotal, globalActiveInvestorIds] = await Promise.all([
            User.countDocuments({ ...globalQuery, kycStatus: 'approved' }),
            User.countDocuments({ ...globalQuery, isActive: false }),
            Investment.distinct('userId', { isActive: true })
        ]);

        // Get users

        const users = await User.find(query)
            .select('-password -refreshToken')
            .sort({ createdAt: -1 })
            .skip((pagination.page - 1) * pagination.limit)
            .limit(pagination.limit)
            .lean();

        // Get investments for each user
        const userStats = await Promise.all(users.map(async (user) => {
            const investments = await Investment.find({ userId: user._id, isActive: true });
            const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
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
                activeInvestments: investments.length
            };
        }));

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
