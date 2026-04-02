import connectDB from '@/lib/db';
import PlatformSettings from '@/models/PlatformSettings';
import { requireAdmin } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/response';
import ActivityLog from '@/models/ActivityLog';

// GET - Get all settings
export async function GET(request) {
    try {
        await connectDB();

        const auth = await requireAdmin(request);
        if (!auth.success) {
            return auth.response;
        }

        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');

        let settings;
        if (category) {
            settings = await PlatformSettings.getByCategory(category);
        } else {
            settings = await PlatformSettings.getAll();
        }

        return successResponse({ settings }, 'Settings retrieved');

    } catch (error) {
        console.error('Admin get settings error:', error);
        return errorResponse('Failed to get settings', 500, error.message);
    }
}

// PUT - Update settings
export async function PUT(request) {
    try {
        await connectDB();

        const auth = await requireAdmin(request);
        if (!auth.success) {
            return auth.response;
        }

        const body = await request.json();
        const { settings, category } = body;

        if (!settings || typeof settings !== 'object') {
            return errorResponse('Settings object is required', 400);
        }

        if (!category) {
            return errorResponse('Category is required', 400);
        }

        // Bulk update settings
        await PlatformSettings.bulkUpdate(settings, category, auth.user._id);

        // Log activity
        ActivityLog.log({
            userId: auth.user._id,
            action: 'admin_settings_update',
            description: `Updated ${category} settings`,
            targetType: 'Settings',
            metadata: { category, keys: Object.keys(settings) }
        });

        return successResponse({
            message: 'Settings updated',
            category,
            updatedKeys: Object.keys(settings)
        }, 'Settings updated successfully');

    } catch (error) {
        console.error('Admin update settings error:', error);
        return errorResponse('Failed to update settings', 500, error.message);
    }
}

// POST - Initialize default settings
export async function POST(request) {
    try {
        await connectDB();

        const auth = await requireAdmin(request);
        if (!auth.success) {
            return auth.response;
        }

        const result = await PlatformSettings.initDefaults();

        // Log activity
        ActivityLog.log({
            userId: auth.user._id,
            action: 'admin_settings_update',
            description: 'Initialized default settings',
            targetType: 'Settings'
        });

        return successResponse(result, 'Default settings initialized');

    } catch (error) {
        console.error('Admin init settings error:', error);
        return errorResponse('Failed to initialize settings', 500, error.message);
    }
}
