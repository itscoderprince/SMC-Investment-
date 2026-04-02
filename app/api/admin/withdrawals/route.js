import connectDB from '@/lib/db';
import Withdrawal from '@/models/Withdrawal';
import User from '@/models/User';
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
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        // Build query
        const query = {};
        if (status && status !== 'all') {
            query.status = status;
        }

        if (search) {
            // Find users matching search
            const users = await User.find({
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { phone: { $regex: search, $options: 'i' } }
                ]
            }).select('_id');
            const userIds = users.map(u => u._id);

            query.$or = [
                { requestId: { $regex: search, $options: 'i' } },
                { userId: { $in: userIds } },
                { transactionReference: { $regex: search, $options: 'i' } }
            ];
        }

        // Get total count
        const total = await Withdrawal.countDocuments(query);

        // Get withdrawals
        const withdrawals = await Withdrawal.find(query)
            .populate('userId', 'name email phone')
            .sort({ createdAt: -1 })
            .skip((pagination.page - 1) * pagination.limit)
            .limit(pagination.limit)
            .lean();

        // Get stats
        const stats = await Withdrawal.getStats();
        const pendingTotal = stats.pending?.count || 0;
        const pendingAmount = stats.pending?.total || 0;
        const processedTotal = (stats.approved?.count || 0) + (stats.completed?.count || 0);
        const processedAmount = (stats.approved?.total || 0) + (stats.completed?.total || 0);
        const rejectedTotal = stats.rejected?.count || 0;
        const totalAmount = processedAmount; // Total successful withdrawals

        return successResponse({
            withdrawals: withdrawals.map(w => ({
                _id: w._id,
                requestId: w.requestId,
                amount: w.amount,
                netAmount: w.netAmount,
                processingFee: w.processingFee,
                status: w.status,
                method: w.method,
                bankDetails: w.bankDetails,
                cryptoDetails: w.cryptoDetails,
                user: w.userId ? {
                    id: w.userId._id,
                    name: w.userId.name,
                    email: w.userId.email
                } : null,
                createdAt: w.createdAt,
                processedAt: w.processedAt,
                transactionReference: w.transactionReference
            })),
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                pages: Math.ceil(total / pagination.limit),
                pendingTotal,
                pendingAmount,
                processedTotal,
                processedAmount,
                rejectedTotal,
                totalAmount
            }
        }, 'Withdrawals retrieved');

    } catch (error) {
        console.error('Admin get withdrawals error:', error);
        return errorResponse('Failed to get withdrawals', 500, error.message);
    }
}
