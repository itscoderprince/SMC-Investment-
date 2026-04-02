import connectDB from '@/lib/db';
import User from '@/models/User';
import { requireAuth } from '@/lib/middleware/auth';
import { comparePassword } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/response';
import ActivityLog from '@/models/ActivityLog';
import Investment from '@/models/Investment';

export async function DELETE(request) {
    try {
        await connectDB();

        const auth = await requireAuth(request);
        if (!auth.success) {
            return auth.response;
        }

        const { user } = auth;
        const body = await request.json();
        const { password, confirmation } = body;

        // Require confirmation text
        if (confirmation !== 'DELETE MY ACCOUNT') {
            return errorResponse('Please type "DELETE MY ACCOUNT" to confirm', 400);
        }

        // Verify password
        const userWithPassword = await User.findById(user._id).select('+password');
        const isPasswordValid = await comparePassword(password, userWithPassword.password);

        if (!isPasswordValid) {
            return errorResponse('Password is incorrect', 400);
        }

        // Check for active investments
        const activeInvestments = await Investment.countDocuments({
            userId: user._id,
            isActive: true
        });

        if (activeInvestments > 0) {
            return errorResponse(
                'Cannot delete account with active investments. Please withdraw your funds first.',
                400
            );
        }

        // Soft delete - deactivate account instead of removing
        user.isActive = false;
        user.email = `deleted_${user._id}_${user.email}`;
        user.phone = `deleted_${user._id}_${user.phone}`;
        await user.save();

        // Log activity
        ActivityLog.log({
            userId: user._id,
            action: 'account_delete',
            description: 'Account deleted (soft delete)',
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
        });

        return successResponse(null, 'Account deleted successfully');

    } catch (error) {
        console.error('Delete account error:', error);
        return errorResponse('Failed to delete account', 500, error.message);
    }
}
