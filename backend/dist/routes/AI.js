"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const checkIn_1 = __importDefault(require("../models/checkIn"));
const toolFeedback_1 = __importDefault(require("../models/toolFeedback"));
const encryption_1 = require("../utils/encryption");
const geminiUtils_1 = require("../utils/geminiUtils");
const userAuth_1 = __importDefault(require("../middleware/userAuth"));
const router = (0, express_1.Router)();
// Save user's Gemini API key and model preference
router.post('/settings', userAuth_1.default, async (req, res) => {
    try {
        const { apiKey, model } = req.body;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if (!apiKey || !model) {
            return res.status(400).json({ error: 'API key and model are required' });
        }
        // Validate API key format (basic check)
        if (!apiKey.startsWith('AIza')) {
            return res.status(400).json({ error: 'Invalid API key format' });
        }
        // Encrypt the API key before storing
        const encryptedKey = (0, encryption_1.encryptApiKey)(apiKey);
        // Update user with encrypted API key
        user.geminiApiKey = encryptedKey;
        user.geminiModel = model;
        await user.save();
        res.json({ message: 'API settings saved successfully' });
    }
    catch (error) {
        console.error('Error saving API settings:', error);
        res.status(500).json({ error: 'Failed to save API settings' });
    }
});
// Get user's Gemini model preference
router.get('/settings', userAuth_1.default, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if (!user.geminiModel) {
            return res.status(400).json({ error: 'No Gemini model configured' });
        }
        res.json({ model: user.geminiModel });
    }
    catch (error) {
        console.error('Error fetching API settings:', error);
        res.status(500).json({ error: 'Failed to fetch API settings' });
    }
});
// Generate emotional wrap for user's check-ins
router.post('/generate-wrap', userAuth_1.default, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // Check if user has API key configured
        if (!user.geminiApiKey) {
            return res.status(400).json({ error: 'Gemini API key not configured. Please add it in settings.' });
        }
        // Decrypt the API key
        const apiKey = (0, encryption_1.decryptApiKey)(user.geminiApiKey);
        const model = user.geminiModel || 'gemini-2.0-flash';
        // Fetch user's recent check-ins with populated references
        const checkins = await checkIn_1.default.find({ userId: user._id })
            .populate('emotion')
            .populate('activityTag')
            .populate('placeTag')
            .populate('peopleTag')
            .sort({ createdAt: -1 })
            .limit(10);
        if (!checkins || checkins.length === 0) {
            return res.status(400).json({ error: 'No check-ins found' });
        }
        // Generate wrap using Gemini
        const genAI = (0, geminiUtils_1.createGeminiClient)(apiKey);
        const insight = await (0, geminiUtils_1.generateEmotionalWrap)(genAI, model, checkins);
        res.json(insight);
    }
    catch (error) {
        console.error('Error generating wrap:', error);
        // Handle quota exceeded
        if (error.message && error.message.includes('quota')) {
            return res.status(429).json({ error: 'API quota exceeded. Please try again later.' });
        }
        // Handle invalid API key
        if (error.message && error.message.includes('invalid')) {
            return res.status(401).json({ error: 'Invalid API key. Please update it in settings.' });
        }
        res.status(500).json({ error: 'Failed to generate emotional wrap' });
    }
});
// Generate feedback insights from user's tool feedback
router.post('/insights', userAuth_1.default, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // Check if user has API key configured
        if (!user.geminiApiKey) {
            return res.status(400).json({ error: 'Gemini API key not configured. Please add it in settings.' });
        }
        // Decrypt the API key
        const apiKey = (0, encryption_1.decryptApiKey)(user.geminiApiKey);
        const model = user.geminiModel || 'gemini-2.0-flash';
        // Fetch user's tool feedback with populated check-ins
        const feedbacks = await toolFeedback_1.default.find({ userId: user._id })
            .populate({
            path: 'checkIn',
            populate: [
                { path: 'emotion' },
                { path: 'activityTag' },
                { path: 'placeTag' },
                { path: 'peopleTag' }
            ]
        })
            .sort({ createdAt: -1 })
            .limit(50);
        if (!feedbacks || feedbacks.length === 0) {
            return res.status(400).json({ error: 'No tool feedback found' });
        }
        // Generate insights using Gemini
        const genAI = (0, geminiUtils_1.createGeminiClient)(apiKey);
        const insights = await (0, geminiUtils_1.generateFeedbackInsights)(genAI, model, feedbacks);
        res.json(insights);
    }
    catch (error) {
        console.error('Error generating insights:', error);
        if (error.message && error.message.includes('quota')) {
            return res.status(429).json({ error: 'API quota exceeded. Please try again later.' });
        }
        if (error.message && error.message.includes('invalid')) {
            return res.status(401).json({ error: 'Invalid API key. Please update it in settings.' });
        }
        res.status(500).json({ error: 'Failed to generate feedback insights' });
    }
});
exports.default = router;
