import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { dbConnect } from "./db/db.js";
import authRoutes from './routes/Auth.routes.js'
import userRoutes from './routes/User.routes.js'
import projectRoutes from './routes/Project.routes.js'
import volunteerHoursRoutes from './routes/VolunteerHours.routes.js'
import notificationRoutes from './routes/Notification.routes.js'

dotenv.config()

const app = express();
const PORT = process.env.PORT || 5001;

// CORS configuration - allow all origins for production
app.use(cors({
    origin: true,  // Allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(cookieParser());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/project', projectRoutes)
app.use('/api/hours', volunteerHoursRoutes)
app.use('/api/notifications', notificationRoutes)

// Start server AFTER database connection
const startServer = async () => {
    try {
        // Connect to database first
        await dbConnect();
        console.log('✅ Database connected successfully');

        // Then start the server
        app.listen(PORT, () => {
            console.log(`✅ Server running on port: ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});