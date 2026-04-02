import connectDB from '@/lib/db';
import Withdrawal from '@/models/Withdrawal';
import { requireAuth } from '@/lib/middleware/auth';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/response';

export async function GET(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        const auth = await requireAuth(request);
        if (!auth.success) {
            return auth.response;
        }

        const withdrawal = await Withdrawal.findOne({
            _id: id,
            userId: auth.user._id
        });

        if (!withdrawal) {
            return notFoundResponse('Withdrawal request not found');
        }

        return successResponse(withdrawal);
    } catch (error) {
        console.error('Get withdrawal error:', error);
        return errorResponse('Failed to get withdrawal details', 500, error.message);
    }
}
