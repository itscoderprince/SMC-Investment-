import connectDB from '@/lib/db';
import mongoose from 'mongoose';
import { requireAuth } from '@/lib/middleware/auth';
import { successResponse, errorResponse, validationErrorResponse, createdResponse } from '@/lib/response';
import { validateRequest, createTicketSchema, parsePagination } from '@/lib/validation';
import { sendTicketConfirmationEmail } from '@/lib/email';
import ActivityLog from '@/models/ActivityLog';
import { generateId } from '@/lib/id';

// Helper to ensure model is registered and returned
async function getTicketModel() {
    if (mongoose.models.Ticket) {
        return mongoose.models.Ticket;
    }
    const model = (await import('@/models/Ticket')).default;
    return model;
}

// GET - List user's tickets
export async function GET(request) {
    try {
        await connectDB();
        const Ticket = await getTicketModel();

        const auth = await requireAuth(request);
        if (!auth.success) {
            return auth.response;
        }

        const { user } = auth;
        const { searchParams } = new URL(request.url);
        const pagination = parsePagination(searchParams);
        const status = searchParams.get('status');

        // Build query
        const query = { userId: user._id };
        if (status && status !== 'all') {
            query.status = status;
        }

        // Get total count
        const total = await Ticket.countDocuments(query);

        // Get tickets
        const tickets = await Ticket.find(query)
            .sort({ lastActivityAt: -1 })
            .skip((pagination.page - 1) * pagination.limit)
            .limit(pagination.limit)
            .lean();

        return successResponse({
            tickets: tickets.map(t => ({
                id: t._id,
                ticketId: t.ticketId,
                subject: t.subject,
                category: t.category,
                priority: t.priority,
                status: t.status,
                replyCount: Array.isArray(t.messages) ? t.messages.length : 0,
                createdAt: t.createdAt,
                lastActivityAt: t.lastActivityAt
            })),
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                pages: Math.ceil(total / pagination.limit)
            }
        }, 'Tickets retrieved');

    } catch (error) {
        console.error('Get tickets error:', error);
        return errorResponse('Failed to get tickets', 500, error.message);
    }
}

// POST - Create new ticket
export async function POST(request) {
    try {
        await connectDB();

        const auth = await requireAuth(request);
        if (!auth.success) {
            return auth.response;
        }

        const { user } = auth;

        let body;
        try {
            body = await request.json();
            if (!body) throw new Error('Empty request body');
        } catch (e) {
            return errorResponse('Invalid JSON format', 400);
        }

        const validation = await validateRequest(createTicketSchema, body);
        if (!validation.success) {
            return validationErrorResponse(validation.errors);
        }

        const { subject, description, category, priority } = validation.data;

        const Ticket = await getTicketModel();

        // Use the imported generateId directly
        const ticketId = generateId('TKT', 8);

        const ticket = new Ticket({
            userId: user._id,
            ticketId,
            subject,
            description,
            category,
            priority,
            status: 'open'
        });

        // Explicit validation to catch errors before save
        await ticket.validate();
        await ticket.save();

        // Non-critical operations
        try {
            await sendTicketConfirmationEmail(user, ticket);
        } catch (emailErr) {
            console.error('Email failed (non-critical):', emailErr.message);
        }

        try {
            if (typeof ActivityLog?.create === 'function') {
                await ActivityLog.create({
                    userId: user._id,
                    action: 'ticket_create',
                    description: `Support ticket created: ${subject}`,
                    targetId: ticket._id,
                    targetType: 'Ticket',
                    status: 'success'
                });
            }
        } catch (logErr) {
            console.error('Activity logging failed (non-critical):', logErr.message);
        }

        return createdResponse({
            id: ticket._id,
            ticketId: ticket.ticketId,
            subject: ticket.subject,
            category: ticket.category,
            status: ticket.status,
            createdAt: ticket.createdAt
        }, 'Ticket created successfully');

    } catch (error) {
        console.error('Ticket creation failed:', error);
        return errorResponse(
            'Failed to create support ticket. Please try again.',
            500,
            process.env.NODE_ENV === 'development' ? error.message : undefined
        );
    }
}
