import connectDB from '@/lib/db';
import Index from '@/models/Index';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/response';

// GET - Get single index details
export async function GET(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        let query = {};
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            query = { _id: id };
        } else {
            query = { slug: id };
        }

        const index = await Index.findOne({ ...query, isActive: true }).select('-__v');

        if (!index) {
            return notFoundResponse('Investment index not found');
        }

        return successResponse(index);
    } catch (error) {
        console.error('Get index details error:', error);
        return errorResponse('Failed to get index details', 500, error.message);
    }
}
