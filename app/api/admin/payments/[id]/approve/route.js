// File updated to resolve stale build cache error
import connectDB from '@/lib/db';
import PaymentRequest from '@/models/PaymentRequest';
import Investment from '@/models/Investment'; // Ensure registered
import Index from '@/models/Index'; // Ensure registered
import User from '@/models/User'; // Ensure registered
import Referral from '@/models/Referral'; // Ensure registered for referral logic in approve()
import ReferralBonus from '@/models/ReferralBonus'; // Ensure registered for referral logic in approve()
import { requireAdmin } from '@/lib/middleware/auth';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/response';
import { sendPaymentApprovedEmail } from '@/lib/email';

// Force dynamic to prevent caching
export const dynamic = 'force-dynamic';
import ActivityLog from '@/models/ActivityLog';

// PUT/POST - Approve Payment
export async function PUT(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        console.log(`Admin Payment Approve: ID ${id}`);

        const auth = await requireAdmin(request);
        if (!auth.success) {
            console.log('Admin Payment Approve: Auth Failed');
            return auth.response;
        }

        const paymentRequest = await PaymentRequest.findById(id).populate('userId');
        console.log(`Admin Payment Approve: Request Found: ${!!paymentRequest}`);
        if (!paymentRequest) {
            return notFoundResponse('Payment request not found');
        }

        if (paymentRequest.status === 'approved') {
            return errorResponse('Payment is already approved', 400);
        }

        // Use model method to approve
        const result = await paymentRequest.approve(auth.user._id);

        // Send confirmation email (non-blocking)
        sendPaymentApprovedEmail(paymentRequest.userId, paymentRequest, result.investment).catch(console.error);

        // Log activity
        ActivityLog.log({
            userId: auth.user._id,
            action: 'payment_approve',
            description: `Approved payment of $${paymentRequest.amount} for user: ${paymentRequest.userId.email}`,
            targetId: paymentRequest._id,
            targetType: 'PaymentRequest'
        });

        console.log('Admin Payment Approve: Success');

        return successResponse({
            paymentRequest: result.paymentRequest,
            investment: result.investment
        }, 'Payment approved and investment created successfully');
    } catch (error) {
        console.error('Admin approve payment error:', error);
        console.error('Stack:', error.stack);
        return errorResponse('Failed to approve payment', 500, error.message);
    }
}

export async function POST(request, { params }) {
    return PUT(request, { params });
}
