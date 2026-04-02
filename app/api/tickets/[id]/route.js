import connectDB from '@/lib/db';
import Ticket from '@/models/Ticket';
import { requireAuth } from '@/lib/middleware/auth';
import { successResponse, errorResponse, notFoundResponse, validationErrorResponse } from '@/lib/response';
import { validateRequest, ticketReplySchema } from '@/lib/validation';
import ActivityLog from '@/models/ActivityLog';

// GET - Get ticket details and messages
export async function GET(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        const auth = await requireAuth(request);
        if (!auth.success) {
            return auth.response;
        }

        const ticket = await Ticket.findOne({
            _id: id,
            userId: auth.user._id
        });

        if (!ticket) {
            return notFoundResponse('Ticket not found');
        }

        return successResponse(ticket);
    } catch (error) {
        console.error('Get ticket error:', error);
        return errorResponse('Failed to get ticket details', 500, error.message);
    }
}

// POST - Add a message/reply to ticket
export async function POST(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        const auth = await requireAuth(request);
        if (!auth.success) {
            return auth.response;
        }

        const body = await request.json();
        const validation = await validateRequest(ticketReplySchema, body);
        if (!validation.success) {
            return validationErrorResponse(validation.errors);
        }

        const ticket = await Ticket.findOne({
            _id: id,
            userId: auth.user._id
        });

        if (!ticket) {
            return notFoundResponse('Ticket not found');
        }

        if (ticket.status === 'closed') {
            return errorResponse('Cannot reply to a closed ticket', 400);
        }

        // Add message using model method
        await ticket.addMessage(
            auth.user._id,
            validation.data.message,
            'user',
            auth.user.name
        );

        // Log activity
        ActivityLog.log({
            userId: auth.user._id,
            action: 'ticket_reply',
            description: `Replied to ticket: ${ticket.ticketId}`,
            targetId: ticket._id,
            targetType: 'Ticket'
        });

        return successResponse(ticket, 'Reply sent successfully');
    } catch (error) {
        console.error('Reply to ticket error:', error);
        return errorResponse('Failed to send reply', 500, error.message);
    }
}
