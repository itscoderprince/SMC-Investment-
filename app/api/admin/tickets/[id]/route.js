import connectDB from '@/lib/db';
import Ticket from '@/models/Ticket';
import { requireAdmin } from '@/lib/middleware/auth';
import { successResponse, errorResponse, notFoundResponse, validationErrorResponse } from '@/lib/response';
import { validateRequest, ticketReplySchema } from '@/lib/validation';
import ActivityLog from '@/models/ActivityLog';

// GET - Get ticket details (Admin)
export async function GET(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        const auth = await requireAdmin(request);
        if (!auth.success) {
            return auth.response;
        }

        const ticket = await Ticket.findById(id).populate('userId', 'name email phone');
        if (!ticket) {
            return notFoundResponse('Ticket not found');
        }

        return successResponse(ticket);
    } catch (error) {
        console.error('Admin get ticket error:', error);
        return errorResponse('Failed to get ticket details', 500, error.message);
    }
}

// POST - Admin reply to ticket
export async function POST(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        const auth = await requireAdmin(request);
        if (!auth.success) {
            return auth.response;
        }

        const body = await request.json();
        const validation = await validateRequest(ticketReplySchema, body);
        if (!validation.success) {
            return validationErrorResponse(validation.errors);
        }

        const ticket = await Ticket.findById(id);
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
            'admin',
            auth.user.name
        );

        // Optional: Update assignee if not already assigned
        if (!ticket.assignedTo) {
            ticket.assignedTo = auth.user._id;
            await ticket.save();
        }

        // Log activity
        ActivityLog.log({
            userId: auth.user._id,
            action: 'admin_ticket_reply',
            description: `Admin replied to ticket: ${ticket.ticketId}`,
            targetId: ticket._id,
            targetType: 'Ticket'
        });

        return successResponse(ticket, 'Reply sent successfully');
    } catch (error) {
        console.error('Admin reply to ticket error:', error);
        return errorResponse('Failed to send reply', 500, error.message);
    }
}

// PUT - Update ticket status/priority (Admin)
export async function PUT(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        const auth = await requireAdmin(request);
        if (!auth.success) {
            return auth.response;
        }

        const body = await request.json();
        const ticket = await Ticket.findById(id);

        if (!ticket) {
            return notFoundResponse('Ticket not found');
        }

        const { status, priority, assignedTo } = body;

        if (status) ticket.status = status;
        if (priority) ticket.priority = priority;
        if (assignedTo) {
            ticket.assignedTo = assignedTo === 'me' ? auth.user._id : assignedTo;
        }

        await ticket.save();

        // Log activity
        ActivityLog.log({
            userId: auth.user._id,
            action: 'admin_ticket_update',
            description: `Admin updated ticket ${ticket.ticketId}: ${JSON.stringify(body)}`,
            targetId: ticket._id,
            targetType: 'Ticket'
        });

        return successResponse(ticket, 'Ticket updated successfully');
    } catch (error) {
        console.error('Admin update ticket error:', error);
        return errorResponse('Failed to update ticket', 500, error.message);
    }
}
