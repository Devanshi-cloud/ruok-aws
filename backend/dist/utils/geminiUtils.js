"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFeedbackInsights = exports.generateEmotionalWrap = exports.createGeminiClient = void 0;
const generative_ai_1 = require("@google/generative-ai");
const createGeminiClient = (apiKey) => {
    return new generative_ai_1.GoogleGenerativeAI(apiKey);
};
exports.createGeminiClient = createGeminiClient;
const generateEmotionalWrap = async (genAI, model, checkins) => {
    try {
        const checkinsData = checkins.map((checkin) => ({
            emotion: checkin.emotion?.title || checkin.emotion?.name || 'Unknown',
            description: checkin.description || null,
            activityTag: checkin.activityTag?.name || null,
            placeTag: checkin.placeTag?.name || null,
            peopleTag: checkin.peopleTag?.name || null,
        }));
        const prompt = `
        Based on the following emotional check-ins from the user, provide:
        1. A brief emotional wrap/summary
        2. The emotional trend (improving/declining/stable)
        3. 2-3 actionable suggestions

        Check-ins:
        ${JSON.stringify(checkinsData, null, 2)}

        Respond in JSON format with keys: insight, emotionalTrend, suggestions (array)
        `;
        const geminiModel = genAI.getGenerativeModel({ model });
        const result = await geminiModel.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
        });
        const responseText = result.response.text();
        return JSON.parse(responseText);
    }
    catch (error) {
        console.error('Error generating emotional wrap:', error);
        throw new Error('Failed to generate emotional wrap');
    }
};
exports.generateEmotionalWrap = generateEmotionalWrap;
const generateFeedbackInsights = async (genAI, model, feedbackData) => {
    try {
        const prompt = `
        Analyze the following tool feedback data and provide:
        1. Top 3 most effective tools with effectiveness scores (0-10)
        2. Personalized recommendations
        3. Identified emotional patterns

        Feedback data:
        ${JSON.stringify(feedbackData, null, 2)}

        Respond in JSON format with keys: topTools (array with tool and effectiveness), recommendations (array), patterns (array)
        `;
        const geminiModel = genAI.getGenerativeModel({ model });
        const result = await geminiModel.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
        });
        const responseText = result.response.text();
        return JSON.parse(responseText);
    }
    catch (error) {
        console.error('Error generating feedback insights:', error);
        throw new Error('Failed to generate feedback insights');
    }
};
exports.generateFeedbackInsights = generateFeedbackInsights;
