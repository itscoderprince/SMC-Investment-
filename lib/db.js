import mongoose from 'mongoose';

const RAW_URI = process.env.MONGODB_URI;

// Ensure database name is in the URI (default to 'smc')
function getMongoURI() {
    if (!RAW_URI) return null;
    // If URI already has a db name between the last '/' and '?', keep it
    const url = new URL(RAW_URI);
    if (!url.pathname || url.pathname === '/') {
        url.pathname = '/smc';
    }
    return url.toString();
}

const MONGODB_URI = getMongoURI();

// Global cache for Next.js hot reloading
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI environment variable is not defined');
    }

    // If already connected, return cached connection
    if (cached.conn) {
        return cached.conn;
    }

    // If connection promise doesn't exist, create it
    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 10,
            minPoolSize: 2,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts)
            .then((mongoose) => {
                console.log('✅ MongoDB connected successfully');
                return mongoose;
            })
            .catch((error) => {
                console.error('❌ MongoDB connection error:', error);
                cached.promise = null;
                throw error;
            });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default connectDB;
