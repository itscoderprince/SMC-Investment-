import connectDB from '@/lib/db';
import Withdrawal from '@/models/Withdrawal';
import { requireAdmin } from '@/lib/middleware/auth';
import { successResponse, errorResponse, notFoundResponse, validationErrorResponse } from '@/lib/response';
import { validateRequest, rejectWithdrawalSchema } from '@/lib/validation';
import { sendWithdrawalRejectionEmail } from '@/lib/email';
import ActivityLog from '@/models/ActivityLog';

// PUT/POST - Reject Withdrawal
export async function PUT(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        const auth = await requireAdmin(request);
        if (!auth.success) {
            return auth.response;
        }

        const body = await request.json();
        const validation = await validateRequest(rejectWithdrawalSchema, body);
        if (!validation.success) {
            return validationErrorResponse(validation.errors);
        }

        const withdrawal = await Withdrawal.findById(id).populate('userId');
        if (!withdrawal) {
            return notFoundResponse('Withdrawal request not found');
        }

        // Use model method to reject
        await withdrawal.reject(auth.user._id, validation.data.reason);

        // Send email (non-blocking)
        sendWithdrawalRejectionEmail(withdrawal.userId, validation.data.reason).catch(console.error);

        // Log activity
        ActivityLog.log({
            userId: auth.user._id,
            action: 'withdrawal_reject',
            description: `Rejected withdrawal for user: ${withdrawal.userId.email}. Reason: ${validation.data.reason}`,
            targetId: withdrawal._id,
            targetType: 'Withdrawal'
        });

        return successResponse(withdrawal, 'Withdrawal rejected successfully');
    } catch (error) {
        console.error('Admin reject withdrawal error:', error);
        return errorResponse('Failed to reject withdrawal', 500, error.message);
    }
}

export async function POST(request, { params }) {
    return PUT(request, { params });
}
