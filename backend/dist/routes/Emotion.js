"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const emotion_1 = __importDefault(require("../models/emotion"));
const userAuth_1 = __importDefault(require("../middleware/userAuth"));
const router = express_1.default.Router();
// TODO: Restrict this endpoint to admin only
router.post("/new", userAuth_1.default, async (req, res) => {
    const { title, description, type, intensity } = req.body;
    try {
        const existingEmotion = await emotion_1.default.findOne({ title });
        if (existingEmotion)
            return res.status(400).json({ message: "Emotion already exists" });
        const emotion = new emotion_1.default({ title, description, type, intensity });
        await emotion.save();
        res.status(200).json({ message: "Emotion created successfully", emotion });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
});
router.get("/getAll", userAuth_1.default, async (_req, res) => {
    try {
        const allEmotions = await emotion_1.default.find();
        res.status(200).json({ message: "Fetched All emotions", data: allEmotions });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.default = router;
