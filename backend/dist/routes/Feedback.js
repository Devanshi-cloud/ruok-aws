"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userAuth_1 = __importDefault(require("../middleware/userAuth"));
const toolFeedback_1 = __importDefault(require("../models/toolFeedback"));
const checkIn_1 = __importDefault(require("../models/checkIn"));
const router = express_1.default.Router();
router.post("/new", userAuth_1.default, async (req, res) => {
    try {
        const userId = req.user._id;
        const { toolName, rating, checkIn } = req.body;
        const isCheckin = await checkIn_1.default.findById(checkIn);
        if (!isCheckin)
            return res.status(404).json({ message: "Invalid Checkin Id" });
        const newFeedback = new toolFeedback_1.default({ userId, toolName, rating, checkIn });
        await newFeedback.save();
        await newFeedback.populate({
            path: "checkIn",
            populate: [
                { path: "emotion" },
                { path: "activityTag" },
                { path: "placeTag" },
                { path: "peopleTag" },
            ],
        });
        res.status(200).json({ message: "Successfully created new Feedback", data: newFeedback });
    }
    catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});
router.get("/getAll", userAuth_1.default, async (req, res) => {
    try {
        const userId = req.user._id;
        const feedbacks = await toolFeedback_1.default.find({ userId }).populate({
            path: "checkIn",
            populate: [
                { path: "emotion" },
                { path: "activityTag" },
                { path: "placeTag" },
                { path: "peopleTag" },
            ],
        });
        res.status(200).json({ message: "Fetched All Feedbacks", data: feedbacks });
    }
    catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.default = router;
