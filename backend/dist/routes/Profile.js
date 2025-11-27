"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userAuth_1 = __importDefault(require("../middleware/userAuth"));
const user_1 = __importDefault(require("../models/user"));
const validations_1 = require("../utils/validations");
const router = express_1.default.Router();
router.get("/get", userAuth_1.default, async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await user_1.default.findById(userId).select("-password");
        if (!user)
            return res.status(404).json({ message: "User not found" });
        res.status(200).json({ message: "fetched", data: user });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "error" });
    }
});
router.patch("/edit", userAuth_1.default, async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0)
            return res.status(400).json({ message: "Invalid Body" });
        if (!(0, validations_1.editProfileValidation)(req))
            return res.status(400).json({ message: "Invalid Edit Fields" });
        const user = req.user;
        if (!user)
            return res.status(404).json({ message: "User not found" });
        const updatedUser = await user_1.default.findByIdAndUpdate(user._id, req.body, { new: true });
        res.status(200).json({ message: "Updated User Profile", data: updatedUser });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.default = router;
