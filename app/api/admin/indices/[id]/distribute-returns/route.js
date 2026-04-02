import connectDB from '@/lib/db';
import Index from '@/models/Index';
import Investment from '@/models/Investment';
import { requireAdmin } from '@/lib/middleware/auth';
import { successResponse, errorResponse, notFoundResponse, validationErrorResponse } from '@/lib/response';
import { validateRequest, distributeReturnsSchema } from '@/lib/validation';
import ActivityLog from '@/models/ActivityLog';

// POST - Distribute returns for an index
export async function POST(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        const auth = await requireAdmin(request);
        if (!auth.success) {
            return auth.response;
        }

        const body = await request.json();
        const validation = await validateRequest(distributeReturnsSchema, body);
        if (!validation.success) {
            return validationErrorResponse(validation.errors);
        }

        const index = await Index.findById(id);
        if (!index) {
            return notFoundResponse('Index not found');
        }

        const { returnRate, weekStart, weekEnd } = validation.data;

        // Find all active investments for this index
        const investments = await Investment.find({
            indexId: id,
            status: 'active',
            isActive: true
        });

        if (investments.length === 0) {
            return successResponse({ count: 0 }, 'No active investments found for this index');
        }

        // Idempotency check: Check if returns for this index and week already exist
        const existingRecord = await Investment.findOne({
            indexId: id,
            'weeklyReturns.weekStart': new Date(weekStart),
            'weeklyReturns.weekEnd': new Date(weekEnd)
        });

        if (existingRecord) {
            return errorResponse('Returns for this index and period have already been distributed', 400);
        }

        // Distribution logic using high-performance Bulk Operations to prevent lag
        const ops = investments.map(investment => {
            // Accuracy: Robust rounding to 2 decimal places
            const returnAmount = Math.round((investment.amount * returnRate) / 100 * 100) / 100;
            const weekNumber = investment.weeklyReturns.length + 1;

            return {
                updateOne: {
                    filter: { _id: investment._id },
                    update: {
                        $push: {
                            weeklyReturns: {
                                week: weekNumber,
                                weekStart: new Date(weekStart),
                                weekEnd: new Date(weekEnd),
                                returnRate,
                                returnAmount,
                                creditedAt: new Date()
                            }
                        },
                        $inc: { totalReturns: returnAmount },
                        $set: { lastReturnDate: new Date() }
                    }
                }
            };
        });

        let distributedCount = ops.length;
        let totalDistributedAmount = 0;

        if (ops.length > 0) {
            await Investment.bulkWrite(ops);
            totalDistributedAmount = Math.round(ops.reduce((acc, op) => acc + op.updateOne.update.$inc.totalReturns, 0) * 100) / 100;
        }

        // Update index stats
        index.totalReturnsDistributed = Math.round((index.totalReturnsDistributed + totalDistributedAmount) * 100) / 100;
        index.currentReturnRate = returnRate;
        await index.save();

        // Log activity
        ActivityLog.log({
            userId: auth.user._id,
            action: 'admin_return_distribute',
            description: `Distributed ${returnRate}% returns for index ${index.name} to ${distributedCount} investors`,
            targetId: index._id,
            targetType: 'Index'
        });

        return successResponse({
            distributedCount,
            totalDistributedAmount,
            index: index.name
        }, 'Returns distributed successfully');

    } catch (error) {
        console.error('Admin distribute returns error:', error);
        return errorResponse('Failed to distribute returns', 500, error.message);
    }
}
