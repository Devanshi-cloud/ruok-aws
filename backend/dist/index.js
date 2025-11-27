"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const database_1 = require("./utils/database");
const cors_1 = __importDefault(require("cors"));
const Auth_1 = __importDefault(require("./routes/Auth"));
const Emotion_1 = __importDefault(require("./routes/Emotion"));
const PlaceTag_1 = __importDefault(require("./routes/PlaceTag"));
const ActivityTag_1 = __importDefault(require("./routes/ActivityTag"));
const PeopleTag_1 = __importDefault(require("./routes/PeopleTag"));
const CheckIn_1 = __importDefault(require("./routes/CheckIn"));
const Profile_1 = __importDefault(require("./routes/Profile"));
const Feedback_1 = __importDefault(require("./routes/Feedback"));
const Booking_1 = __importDefault(require("./routes/Booking"));
const Chat_1 = __importDefault(require("./routes/Chat"));
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
app.use((0, cors_1.default)(corsOptions));
// Handle preflight requests explicitly
app.options('*', (0, cors_1.default)(corsOptions));
// Rest of your middleware
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
require('./utils/cronJobs');
app.use('/api/auth', Auth_1.default);
app.use('/api/emotion', Emotion_1.default);
app.use('/api/checkin', CheckIn_1.default);
app.use('/api/placeTag', PlaceTag_1.default);
app.use('/api/activityTag', ActivityTag_1.default);
app.use('/api/peopleTag', PeopleTag_1.default);
app.use('/api/profile', Profile_1.default);
app.use('/api/feedback', Feedback_1.default);
app.use('/api', Booking_1.default);
app.use('/api/chat', Chat_1.default);
(0, database_1.connectDb)().then(() => {
    console.log("connected to database");
}).catch(() => {
    console.log("Error while connecting to database");
});
module.exports = app;
if (require.main === module) {
    app.listen(8000, () => console.log("Server is running on port 8000"));
}
