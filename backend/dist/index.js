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
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'https://ru-ok.vercel.app', 'https://ruok-sih.vercel.app'],
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
require('dotenv').config();
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
    // app.listen(8000,()=>console.log("Server is running on port 8000"))
}).catch(() => {
    console.log("Error while connecting to database");
});
module.exports = app;
if (require.main === module) {
    app.listen(8000, () => console.log("Server is running on port 8000"));
}
