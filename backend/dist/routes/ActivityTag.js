"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const activityTag_1 = __importDefault(require("../models/activityTag"));
const userAuth_1 = __importDefault(require("../middleware/userAuth"));
const router = express_1.default.Router();
router.get('/getAll', userAuth_1.default, async (req, res) => {
    try {
        const userId = req.user._id;
        const allPeopleTags = await activityTag_1.default.find({ userId: userId });
        res.status(200).json({ message: "Fetched All Activities", data: allPeopleTags });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.default = router;
