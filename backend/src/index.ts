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

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000", "https://sahayak-oaed.vercel.app", "https://sahayak-9iho.vercel.app"],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser())
require('dotenv').config();
require('./utils/cronJobs')

app.use('/api/auth',AuthRouter)
app.use('/api/emotion',EmotionRouter)
app.use('/api/checkin',CheckinRouter)
app.use('/api/placeTag',PlaceTagRouter)
app.use('/api/activityTag',ActivityTagRouter)
app.use('/api/peopleTag',PeopleTagRouter)
app.use('/api/profile',ProfileRouter)
app.use('/api/feedback',FeedbackRouter)
app.use('/api', bookingRoutes)
app.use('/api/chat',chatRouter)

connectDb().then(()=>{
    console.log("connected to database")
    // app.listen(8000,()=>console.log("Server is running on port 8000"))
}).catch(()=>{
    console.log("Error while connecting to database")
})

module.exports=app;

if(require.main===module){
    app.listen(8000,()=>console.log("Server is running on port 8000"))
}