import connectDB from '@/lib/db';
import Withdrawal from '@/models/Withdrawal';
import { requireAdmin } from '@/lib/middleware/auth';
import { successResponse, errorResponse, notFoundResponse, validationErrorResponse } from '@/lib/response';
import { validateRequest, approveWithdrawalSchema } from '@/lib/validation';
import { sendWithdrawalApprovedEmail } from '@/lib/email';
import ActivityLog from '@/models/ActivityLog';

// PUT/POST - Approve Withdrawal
export async function PUT(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        const auth = await requireAdmin(request);
        if (!auth.success) {
            return auth.response;
        }

        const body = await request.json();
        const validation = await validateRequest(approveWithdrawalSchema, body);
        if (!validation.success) {
            return validationErrorResponse(validation.errors);
        }

        const withdrawal = await Withdrawal.findById(id).populate('userId');
        if (!withdrawal) {
            return notFoundResponse('Withdrawal request not found');
        }

        if (withdrawal.status === 'approved' || withdrawal.status === 'completed') {
            return errorResponse('Withdrawal is already approved or completed', 400);
        }

        // Use model method to approve
        await withdrawal.approve(auth.user._id, validation.data.transactionReference);

        // Send email (non-blocking)
        sendWithdrawalApprovedEmail(withdrawal.userId, withdrawal).catch(console.error);

        // Log activity
        ActivityLog.log({
            userId: auth.user._id,
            action: 'withdrawal_approve',
            description: `Approved withdrawal of $${withdrawal.amount} for user: ${withdrawal.userId.email}`,
            targetId: withdrawal._id,
            targetType: 'Withdrawal'
        });

        return successResponse(withdrawal, 'Withdrawal approved successfully');
    } catch (error) {
        console.error('Admin approve withdrawal error:', error);
        return errorResponse('Failed to approve withdrawal', 500, error.message);
    }
}

export async function POST(request, { params }) {
    return PUT(request, { params });
}
