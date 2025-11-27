"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const userAuth_1 = __importDefault(require("../middleware/userAuth"));
const checkIn_1 = __importDefault(require("../models/checkIn"));
const emotion_1 = __importDefault(require("../models/emotion"));
const activityTag_1 = __importDefault(require("../models/activityTag"));
const placeTag_1 = __importDefault(require("../models/placeTag"));
const peopleTag_1 = __importDefault(require("../models/peopleTag"));
router.get('/getAll', userAuth_1.default, async (req, res) => {
    try {
        const userId = req.user._id;
        const checkIn = await checkIn_1.default.find({ userId }).populate('emotion activityTag placeTag peopleTag');
        res.status(200).json({ message: "Fetched All checkIn", data: checkIn });
    }
    catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});
router.post('/new', userAuth_1.default, async (req, res) => {
    try {
        const userId = req.user._id;
        const { emotion, description, activityTag, placeTag, peopleTag } = req.body;
        //validate the emotion first
        const validEmotion = await emotion_1.default.findOne({ title: emotion });
        if (!validEmotion) {
            return res.status(400).send({ message: "Not a valid emotion" });
        }
        //validate tags , if new tag create a new one for user
        let activityTagId = null;
        let placeTagId = null;
        let peopleTagId = null;
        if (activityTag) {
            //need to check the value so trim it down to lowercase
            const normalizedTagValue = activityTag.toLowerCase().trim();
            let existingActivityTag = await activityTag_1.default.findOne({ title: normalizedTagValue, userId });
            if (!existingActivityTag) {
                const newTag = new activityTag_1.default({
                    title: normalizedTagValue,
                    userId: userId
                });
                existingActivityTag = await newTag.save();
            }
            activityTagId = existingActivityTag._id;
        }
        if (placeTag) {
            const normalizedTagValue = placeTag.toLowerCase().trim();
            let existingPlaceTag = await placeTag_1.default.findOne({ title: normalizedTagValue, userId });
            if (!existingPlaceTag) {
                const newTag = new placeTag_1.default({
                    title: normalizedTagValue,
                    userId: userId
                });
                existingPlaceTag = await newTag.save();
            }
            placeTagId = existingPlaceTag._id;
        }
        if (peopleTag) {
            const normalizedTagValue = peopleTag.toLowerCase().trim();
            let existingPeopleTag = await peopleTag_1.default.findOne({ title: normalizedTagValue, userId });
            if (!existingPeopleTag) {
                const newTag = new peopleTag_1.default({
                    title: normalizedTagValue,
                    userId: userId
                });
                existingPeopleTag = await newTag.save();
            }
            peopleTagId = existingPeopleTag._id;
        }
        //create new emotion and populate the data
        const newCheckin = await new checkIn_1.default({
            userId,
            description,
            emotion: validEmotion._id,
            activityTag: activityTagId,
            placeTag: placeTagId,
            peopleTag: peopleTagId,
        }).populate('emotion activityTag placeTag peopleTag');
        await newCheckin.save();
        res.status(200).json({ message: "Successfully created new Checkin", data: newCheckin });
    }
    catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});
router.delete('/delete/:id', userAuth_1.default, async (req, res) => {
    const checkinId = req.params.id;
    const userId = req.user._id;
    try {
        const deletedCheckin = await checkIn_1.default.findOneAndDelete({ _id: checkinId, userId });
        res.status(200).json({ message: "Deleted checkIn", data: deletedCheckin });
    }
    catch (err) {
        res.status(500).json({ message: "Internal Server Error In Deleting Checkin" });
    }
});
router.patch('/update/:id', userAuth_1.default, async (req, res) => {
    const checkinId = req.params.id;
    const userId = req.user._id;
    const { emotion, description, activityTag, placeTag, peopleTag } = req.body;
    try {
        // Find the checkin for this user
        const presentCheckin = await checkIn_1.default.findOne({ _id: checkinId, userId });
        if (!presentCheckin) {
            return res.status(404).json({ message: "Checkin not found for this user" });
        }
        // Update tag titles if provided
        if (activityTag && presentCheckin.activityTag) {
            const normalized = activityTag.toLowerCase().trim();
            await activityTag_1.default.findOneAndUpdate({ _id: presentCheckin.activityTag, userId }, { title: normalized });
        }
        if (placeTag && presentCheckin.placeTag) {
            const normalized = placeTag.toLowerCase().trim();
            await placeTag_1.default.findOneAndUpdate({ _id: presentCheckin.placeTag, userId }, { title: normalized });
        }
        if (peopleTag && presentCheckin.peopleTag) {
            const normalized = peopleTag.toLowerCase().trim();
            await peopleTag_1.default.findOneAndUpdate({ _id: presentCheckin.peopleTag, userId }, { title: normalized });
        }
        // If emotion is provided, validate and update
        let emotionId = presentCheckin.emotion;
        if (emotion) {
            const validEmotion = await emotion_1.default.findOne({ title: emotion.trim() });
            if (!validEmotion)
                return res.status(400).json({ message: "Invalid emotion" });
            emotionId = validEmotion._id;
        }
        // Update the checkin description and emotion if changed
        const updateFields = {};
        if (description)
            updateFields.description = description;
        if (emotionId)
            updateFields.emotion = emotionId;
        const updateCheckin = await checkIn_1.default.findByIdAndUpdate(checkinId, { $set: updateFields }, { new: true }).populate('emotion activityTag placeTag peopleTag');
        res.status(200).json({
            message: "Checkin updated successfully",
            updatedCheckin: updateCheckin
        });
    }
    catch (err) {
        console.error("Error updating checkin:", err);
        res.status(500).json({ message: "Internal Server Error In Updating Checkin" });
    }
});
exports.default = router;
