import { Router, Request, Response } from 'express';
import User from '../models/user';
import CheckIn from '../models/checkIn';
import ToolFeedback from '../models/toolFeedback';
import { encryptApiKey, decryptApiKey } from '../utils/encryption';
import { createGeminiClient, generateEmotionalWrap, generateFeedbackInsights } from '../utils/geminiUtils';
import userAuth from '../middleware/userAuth';

const router = Router();

// Define extended request interface for authenticated requests
interface AuthenticatedRequest extends Request {
    user?: any;
}

// Save user's Gemini API key and model preference
router.post('/settings', userAuth, async (req: AuthenticatedRequest, res: Response) => {
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
        const encryptedKey = encryptApiKey(apiKey);

        // Update user with encrypted API key
        user.geminiApiKey = encryptedKey;
        user.geminiModel = model;
        await user.save();

        res.json({ message: 'API settings saved successfully' });
    } catch (error) {
        console.error('Error saving API settings:', error);
        res.status(500).json({ error: 'Failed to save API settings' });
    }
});

// Get user's Gemini model preference
router.get('/settings', userAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!user.geminiModel) {
            return res.status(400).json({ error: 'No Gemini model configured' });
        }

        res.json({ model: user.geminiModel });
    } catch (error) {
        console.error('Error fetching API settings:', error);
        res.status(500).json({ error: 'Failed to fetch API settings' });
    }
});

// Generate emotional wrap for user's check-ins
router.post('/generate-wrap', userAuth, async (req: AuthenticatedRequest, res: Response) => {
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
        const apiKey = decryptApiKey(user.geminiApiKey);
        const model = user.geminiModel || 'gemini-2.0-flash';

        // Fetch user's recent check-ins with populated references
        const checkins = await CheckIn.find({ userId: user._id })
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
        const genAI = createGeminiClient(apiKey);
        const insight = await generateEmotionalWrap(genAI, model, checkins);

        res.json(insight);
    } catch (error: any) {
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
router.post('/insights', userAuth, async (req: AuthenticatedRequest, res: Response) => {
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
        const apiKey = decryptApiKey(user.geminiApiKey);
        const model = user.geminiModel || 'gemini-2.0-flash';

        // Fetch user's tool feedback with populated check-ins
        const feedbacks = await ToolFeedback.find({ userId: user._id })
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
        const genAI = createGeminiClient(apiKey);
        const insights = await generateFeedbackInsights(genAI, model, feedbacks);

        res.json(insights);
    } catch (error: any) {
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

export default router;
