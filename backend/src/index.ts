import express from 'express';
const app = express();
import cookieParser from 'cookie-parser';
import {connectDb} from "./utils/database";
import cors from "cors";
import AuthRouter from './routes/Auth';
import EmotionRouter from './routes/Emotion';
import PlaceTagRouter from './routes/PlaceTag';
import ActivityTagRouter from './routes/ActivityTag';
import PeopleTagRouter from './routes/PeopleTag';
import CheckinRouter from './routes/CheckIn';
import ProfileRouter from './routes/Profile';
import FeedbackRouter from './routes/Feedback';
import bookingRoutes from './routes/Booking';
import chatRouter from './routes/Chat';

// Load dotenv FIRST
require('dotenv').config();

// Set COOP header to allow Google Sign-In postMessage
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

// CORS Configuration - Add this BEFORE your routes
const corsOptions = {
    origin: [
        'https://sahayak-oaed-dqiigqe7w-devanshi-clouds-projects.vercel.app', // Your latest frontend URL
        'https://sahayak-oaed.vercel.app', // Previous frontend URL (keep for now if still in use)
        'http://localhost:5173', // Local development
        'http://localhost:3000', // Alternative local port
        'https://sahayak-9iho.vercel.app' // Your backend URL (if it's also an origin for some reason)
    ],
    credentials: true, // Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin'
    ],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 86400, // 24 hours
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Rest of your middleware
app.use(express.json());
app.use(cookieParser());
require('./utils/cronJobs');

app.use('/api/auth', AuthRouter);
app.use('/api/emotion', EmotionRouter);
app.use('/api/checkin', CheckinRouter);
app.use('/api/placeTag', PlaceTagRouter);
app.use('/api/activityTag', ActivityTagRouter);
app.use('/api/peopleTag', PeopleTagRouter);
app.use('/api/profile', ProfileRouter);
app.use('/api/feedback', FeedbackRouter);
app.use('/api', bookingRoutes);
app.use('/api/chat', chatRouter);

connectDb().then(()=>{
    console.log("connected to database")
}).catch(()=>{
    console.log("Error while connecting to database")
})

module.exports=app;

if(require.main===module){
    app.listen(8000,()=>console.log("Server is running on port 8000"))
}