import connectDB from '@/lib/db';
import Index from '@/models/Index';
import { requireAdmin } from '@/lib/middleware/auth';
import { successResponse, errorResponse, validationErrorResponse, createdResponse } from '@/lib/response';
import { validateRequest, createIndexSchema } from '@/lib/validation';
import ActivityLog from '@/models/ActivityLog';
import { parsePagination } from '@/lib/validation';

// GET - List all indices
export async function GET(request) {
    try {
        await connectDB();

        const auth = await requireAdmin(request);
        if (!auth.success) {
            return auth.response;
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const pagination = parsePagination(searchParams);

        // Build query
        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await Index.countDocuments(query);

        const indices = await Index.find(query)
            .sort({ sortOrder: 1, name: 1 })
            .skip((pagination.page - 1) * pagination.limit)
            .limit(pagination.limit)
            .lean();

        return successResponse({
            indices: indices.map(i => ({
                id: i._id,
                name: i.name,
                slug: i.slug,
                description: i.description,
                category: i.category,
                riskLevel: i.riskLevel,
                minInvestment: i.minInvestment,
                maxInvestment: i.maxInvestment,
                currentReturnRate: i.currentReturnRate,
                totalInvested: i.totalInvested,
                activeInvestors: i.activeInvestors,
                isActive: i.isActive,
                createdAt: i.createdAt,
                icon: i.icon,
                color: i.color,
                lockPeriod: i.lockPeriod,
            })),
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                pages: Math.ceil(total / pagination.limit)
            }
        }, 'Indices retrieved');

    } catch (error) {
        console.error('Admin get indices error:', error);
        return errorResponse('Failed to get indices', 500, error.message);
    }
}

// POST - Create new index
export async function POST(request) {
    try {
        await connectDB();

        const auth = await requireAdmin(request);
        if (!auth.success) {
            return auth.response;
        }

        const body = await request.json();

        // Validate request
        const validation = await validateRequest(createIndexSchema, body);
        if (!validation.success) {
            return validationErrorResponse(validation.errors);
        }

        // Create index
        const index = await Index.create(validation.data);

        // Log activity
        ActivityLog.log({
            userId: auth.user._id,
            action: 'admin_index_create',
            description: `Created index: ${index.name}`,
            targetId: index._id,
            targetType: 'Index'
        });

        return createdResponse({
            id: index._id,
            name: index.name,
            slug: index.slug,
            isActive: index.isActive
        }, 'Index created successfully');

    } catch (error) {
        console.error('Admin create index error:', error);

        if (error.code === 11000) {
            return errorResponse('Index name already exists', 409);
        }

        return errorResponse('Failed to create index', 500, error.message);
    }
}
