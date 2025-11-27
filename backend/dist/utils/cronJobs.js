"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const user_1 = __importDefault(require("../models/user"));
const mongoose_1 = __importDefault(require("mongoose"));
// Check if mongoose is connected
const isDatabaseConnected = () => mongoose_1.default.connection.readyState === 1;
const deleteGuestUsers = async () => {
    try {
        if (!isDatabaseConnected()) {
            console.error("Database not connected. Skipping guest user cleanup.");
            return;
        }
        const result = await user_1.default.deleteMany({ isGuest: true });
        console.log(`Deleted ${result.deletedCount} guest users at ${new Date().toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
        })}`);
    }
    catch (err) {
        console.error("Error deleting guest users:", err);
    }
};
// Schedule daily at 09:30 IST
node_cron_1.default.schedule("30 9 * * *", deleteGuestUsers, {
    scheduled: true,
    timezone: "Asia/Kolkata",
});
