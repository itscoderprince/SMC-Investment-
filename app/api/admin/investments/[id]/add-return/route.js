import connectDB from '@/lib/db';
import Investment from '@/models/Investment';
import { requireAdmin } from '@/lib/middleware/auth';
import { successResponse, errorResponse, notFoundResponse, validationErrorResponse } from '@/lib/response';
import { validateRequest, setReturnRateSchema } from '@/lib/validation';
import ActivityLog from '@/models/ActivityLog';

// POST - Add a manual return for a specific investment
export async function POST(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        const auth = await requireAdmin(request);
        if (!auth.success) {
            return auth.response;
        }

        const body = await request.json();
        const validation = await validateRequest(setReturnRateSchema, body);
        if (!validation.success) {
            return validationErrorResponse(validation.errors);
        }

        const investment = await Investment.findById(id).populate('indexId');
        if (!investment) {
            return notFoundResponse('Investment not found');
        }

        const { returnRate, weekStart, weekEnd } = validation.data;

        // Add the return using the model method (which now includes idempotency and rounding)
        await investment.addReturn({
            returnRate,
            weekStart: new Date(weekStart),
            weekEnd: new Date(weekEnd)
        });

        // Log activity
        await ActivityLog.log({
            userId: auth.user._id,
            action: 'admin_return_distribute',
            description: `Manually added ${returnRate}% return to investment ${id}`,
            targetId: investment._id,
            targetType: 'Investment',
            metadata: {
                returnRate,
                weekStart,
                weekEnd,
                indexName: investment.indexId?.name
            }
        });

        return successResponse({
            investmentId: investment._id,
            totalReturns: investment.totalReturns,
            roi: investment.roi
        }, 'Manual return added successfully');

    } catch (error) {
        console.error('Add manual return error:', error);
        return errorResponse('Failed to add manual return', 500, error.message);
    }
}
