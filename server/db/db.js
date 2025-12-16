import mongoose from 'mongoose';

let isConnected = false;

export const dbConnect = async () => {
    // If already connected, reuse the connection
    if (isConnected) {
        console.log('Using existing database connection');
        return;
    }

    // If connection exists but readyState is not connected, reuse it
    if (mongoose.connection.readyState >= 1) {
        isConnected = true;
        console.log('Database already connected');
        return;
    }

    try {
        const connect = await mongoose.connect(process.env.MONGO_URI, {
            // Connection pool settings for better performance
            maxPoolSize: 10, // Maximum number of connections in the pool
            minPoolSize: 2,  // Minimum number of connections in the pool
            // Increased timeouts for MongoDB Atlas replica set
            serverSelectionTimeoutMS: 30000, // 30 seconds to select a server
            socketTimeoutMS: 60000, // 60 seconds socket timeout
            connectTimeoutMS: 30000, // 30 seconds to connect
            // Don't use deprecated options
            retryWrites: true,
            w: 'majority',
        });

        isConnected = true;
        console.log(`Database connected: ${connect.connection.host} - ${connect.connection.name}`);


        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
            isConnected = false;
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
            isConnected = false;
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
            isConnected = true;
        });

    } catch (error) {
        console.error(`Database connection error: ${error}`);
        isConnected = false;
        throw error; // Let the caller handle the error
    }
}

// Graceful shutdown
export const dbDisconnect = async () => {
    if (isConnected) {
        await mongoose.connection.close();
        isConnected = false;
        console.log('Database disconnected gracefully');
    }
}