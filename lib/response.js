import { NextResponse } from 'next/server';

// Success response
export function successResponse(data, message = 'Success', statusCode = 200) {
    return NextResponse.json(
        {
            success: true,
            message,
            data,
            timestamp: new Date().toISOString()
        },
        { status: statusCode }
    );
}

// Created response (201)
export function createdResponse(data, message = 'Created successfully') {
    return successResponse(data, message, 201);
}

// Error response
export function errorResponse(message, statusCode = 400, error = null) {
    return NextResponse.json(
        {
            success: false,
            message,
            error: error || message,
            timestamp: new Date().toISOString()
        },
        { status: statusCode }
    );
}

// Not found response
export function notFoundResponse(message = 'Resource not found') {
    return errorResponse(message, 404);
}

// Unauthorized response
export function unauthorizedResponse(message = 'Unauthorized') {
    return errorResponse(message, 401);
}

// Forbidden response
export function forbiddenResponse(message = 'Forbidden') {
    return errorResponse(message, 403);
}

// Internal server error response
export function serverErrorResponse(message = 'Internal server error', error = null) {
    return errorResponse(message, 500, error);
}

// Paginated response
export function paginatedResponse(data, pagination, message = 'Success') {
    return NextResponse.json(
        {
            success: true,
            message,
            data,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total: pagination.total,
                pages: Math.ceil(pagination.total / pagination.limit),
                hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
                hasPrev: pagination.page > 1
            },
            timestamp: new Date().toISOString()
        },
        { status: 200 }
    );
}

// Validation error response
export function validationErrorResponse(errors) {
    return NextResponse.json(
        {
            success: false,
            message: 'Validation failed',
            errors,
            timestamp: new Date().toISOString()
        },
        { status: 422 }
    );
}

// Rate limit response
export function rateLimitResponse(message = 'Too many requests') {
    return NextResponse.json(
        {
            success: false,
            message,
            timestamp: new Date().toISOString()
        },
        { status: 429 }
    );
}
