import connectDB from '@/lib/db';
import Withdrawal from '@/models/Withdrawal';
import { requireAuth } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/response';
import { parsePagination } from '@/lib/validation';

export async function GET(request) {
    try {
        await connectDB();

        const auth = await requireAuth(request);
        if (!auth.success) {
            return auth.response;
        }

        const { user } = auth;
        const { searchParams } = new URL(request.url);
        const pagination = parsePagination(searchParams);
        const status = searchParams.get('status');

        // Build query
        const query = { userId: user._id };
        if (status && status !== 'all') {
            query.status = status;
        }

        // Get total count
        const total = await Withdrawal.countDocuments(query);

        // Get withdrawals
        const withdrawals = await Withdrawal.find(query)
            .sort({ createdAt: -1 })
            .skip((pagination.page - 1) * pagination.limit)
            .limit(pagination.limit)
            .lean();

        return successResponse({
            withdrawals: withdrawals.map(w => ({
                id: w._id,
                requestId: w.requestId,
                amount: w.amount,
                netAmount: w.netAmount,
                processingFee: w.processingFee,
                status: w.status,
                method: w.method,
                bankDetails: w.bankDetails ? {
                    accountHolder: w.bankDetails.accountHolder,
                    accountNumber: 'XXXX' + w.bankDetails.accountNumber.slice(-4),
                    bankName: w.bankDetails.bankName
                } : null,
                cryptoDetails: w.cryptoDetails,
                rejectionReason: w.rejectionReason,
                createdAt: w.createdAt,
                processedAt: w.processedAt
            })),
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                pages: Math.ceil(total / pagination.limit)
            }
        }, 'Withdrawal requests retrieved');

    } catch (error) {
        console.error('Get withdrawals error:', error);
        return errorResponse('Failed to get withdrawals', 500, error.message);
    }
}
