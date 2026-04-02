import connectDB from '@/lib/db';
import Index from '@/models/Index';
import { successResponse, errorResponse } from '@/lib/response';
import { parsePagination } from '@/lib/validation';

// GET - List all active indices (public)
// Forced re-compile: 2026-02-07
export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const pagination = parsePagination(searchParams);
        const category = searchParams.get('category');

        // Build query
        const query = { isActive: true };
        if (category && category !== 'all') {
            query.category = category;
        }

        // Get total count
        const total = await Index.countDocuments(query);

        // Get indices
        const indices = await Index.find(query)
            .select('-__v')
            .sort({ sortOrder: 1, name: 1 })
            .skip((pagination.page - 1) * pagination.limit)
            .limit(pagination.limit)
            .lean();

        return successResponse({
            indices: indices.map(index => ({
                id: index._id,
                name: index.name,
                slug: index.slug,
                description: index.shortDescription || index.description,
                category: index.category,
                riskLevel: index.riskLevel,
                minInvestment: index.minInvestment,
                maxInvestment: index.maxInvestment,
                currentReturnRate: index.currentReturnRate,
                totalInvested: index.totalInvested,
                activeInvestors: index.activeInvestors,
                features: index.features,
                icon: index.icon,
                color: index.color,
                lockPeriod: index.lockPeriod
            })),
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                pages: Math.ceil(total / pagination.limit)
            }
        }, 'Indices retrieved successfully');

    } catch (error) {
        console.error('Get indices error:', error);
        return errorResponse('Failed to get indices', 500, error.message);
    }
}
