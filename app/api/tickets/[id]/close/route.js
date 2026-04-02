import connectDB from '@/lib/db';
import Ticket from '@/models/Ticket';
import { requireAuth } from '@/lib/middleware/auth';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/response';
import ActivityLog from '@/models/ActivityLog';

// PUT/POST - Close ticket
export async function PUT(request, { params }) {
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

        if (ticket.status === 'closed') {
            return successResponse(ticket, 'Ticket is already closed');
        }

        ticket.status = 'closed';
        ticket.closedAt = new Date();
        await ticket.save();

        // Log activity
        ActivityLog.log({
            userId: auth.user._id,
            action: 'ticket_closed',
            description: `Closed ticket: ${ticket.ticketId}`,
            targetId: ticket._id,
            targetType: 'Ticket'
        });

        return successResponse(ticket, 'Ticket closed successfully');
    } catch (error) {
        console.error('Close ticket error:', error);
        return errorResponse('Failed to close ticket', 500, error.message);
    }
}

// Support for POST as well in Case the frontend uses it
export async function POST(request, { params }) {
    return PUT(request, { params });
}
