import connectDB from '@/lib/db';
import Index from '@/models/Index';
import Investment from '@/models/Investment';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/response';

// GET - Get index statistics
export async function GET(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        const index = await Index.findById(id);
        if (!index) {
            return notFoundResponse('Index not found');
        }

        // Get recent investments or some stats
        const totalInvestments = await Investment.countDocuments({ indexId: id, status: 'active' });
        const recentInvestments = await Investment.find({ indexId: id, status: 'active' })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('amount createdAt');

        return successResponse({
            index: {
                id: index._id,
                name: index.name,
                currentReturnRate: index.currentReturnRate,
                statistics: index.statistics
            },
            totalActiveInvestments: totalInvestments,
            recentInvestments
        });
    } catch (error) {
        console.error('Get index stats error:', error);
        return errorResponse('Failed to get index statistics', 500, error.message);
    }
}
