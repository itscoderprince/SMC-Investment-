import connectDB from '@/lib/db';
import PaymentRequest from '@/models/PaymentRequest';
import Index from '@/models/Index'; // Ensure registered for populate
import User from '@/models/User'; // Ensure registered 
import Investment from '@/models/Investment'; // Ensure registered
import PlatformSettings from '@/models/PlatformSettings';
import { requireAuth } from '@/lib/middleware/auth';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/response';

export const dynamic = 'force-dynamic';

// GET - Get payment request details
export async function GET(request, { params }) {
    try {
        await connectDB();

        // 1. Authenticate
        const auth = await requireAuth(request);
        if (!auth.success) {
            return auth.response;
        }

        // 2. Extract ID from params
        const { id } = await params;
        if (!id) {
            return errorResponse('Missing request ID');
        }

        console.log(`[API] Processing Payment Detail: ${id} for user ${auth.user._id}`);

        // 3. Build Query (handle both ObjectId and requestId)
        let query = { userId: auth.user._id };
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            query._id = id;
        } else {
            query.requestId = id;
        }

        // 4. Fetch with explicit populate
        const paymentRequest = await PaymentRequest.findOne(query).populate({
            path: 'indexId',
            select: 'name slug color currentReturnRate',
            model: 'Index'
        });

        if (!paymentRequest) {
            console.warn(`[API] No payment request found for ID: ${id}`);
            return notFoundResponse('Investment request not found');
        }

        // 5. Fetch Settings Safely using optimized method
        let paymentAddresses = {};
        try {
            paymentAddresses = await PlatformSettings.getPaymentAddresses();
        } catch (sErr) {
            console.warn('[API] Payment addresses fetch failed, using fallbacks');
            paymentAddresses = {
                usdt_bep20_address: '0x1234567890abcdef1234567890abcdef12345678',
                usdt_trc20_address: 'TAbcdef1234567890abcdef1234567890a'
            };
        }

        // 6. Build Result Object manually to avoid virtual field or circular dependency crashes during serialization
        const result = {
            paymentRequest: {
                id: paymentRequest._id.toString(),
                _id: paymentRequest._id.toString(),
                requestId: paymentRequest.requestId,
                amount: paymentRequest.amount,
                status: paymentRequest.status,
                paymentMethod: paymentRequest.paymentMethod,
                paymentProof: paymentRequest.paymentProof,
                transactionReference: paymentRequest.transactionReference,
                createdAt: paymentRequest.createdAt,
                expiresAt: paymentRequest.expiresAt,
                notes: paymentRequest.notes,
                index: paymentRequest.indexId ? {
                    id: paymentRequest.indexId._id,
                    name: paymentRequest.indexId.name,
                    slug: paymentRequest.indexId.slug,
                    color: paymentRequest.indexId.color,
                    returnRate: paymentRequest.indexId.currentReturnRate
                } : { name: 'Legacy Index' }
            },
            paymentDetails: {
                paymentMethod: paymentRequest.paymentMethod,
                network: paymentRequest.paymentMethod === 'bep20_usdt' ? 'BEP20' : 'TRC20',
                walletAddress: paymentRequest.paymentMethod === 'bep20_usdt'
                    ? (paymentAddresses.usdt_bep20_address)
                    : (paymentAddresses.usdt_trc20_address),
                amount: paymentRequest.amount
            }
        };

        return successResponse(result);
    } catch (error) {
        console.error('[API CRITICAL ERROR] GET Payment Details:', error);
        return errorResponse('Failed to load request details', 500, error.message);
    }
}
