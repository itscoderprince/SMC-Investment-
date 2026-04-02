import connectDB from '@/lib/db';
import Investment from '@/models/Investment';
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

        const investment = await Investment.findOne({
            _id: id,
            userId: auth.user._id
        }).populate('indexId', 'name icon category');

        if (!investment) {
            return notFoundResponse('Investment not found');
        }

        return successResponse(investment);
    } catch (error) {
        console.error('Get investment error:', error);
        return errorResponse('Failed to get investment details', 500, error.message);
    }
}
