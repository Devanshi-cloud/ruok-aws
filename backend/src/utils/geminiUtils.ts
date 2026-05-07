import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ICheckIn } from '../models/checkIn';

export const createGeminiClient = (apiKey: string) => {
    return new GoogleGenerativeAI(apiKey);
};

export interface WrapInsight {
    insight: string;
    emotionalTrend: string;
    suggestions: string[];
}

export const generateEmotionalWrap = async (
    genAI: GoogleGenerativeAI,
    model: string,
    checkins: ICheckIn[]
): Promise<WrapInsight> => {
    try {
        const checkinsData = checkins.map((checkin: any) => ({
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
    } catch (error) {
        console.error('Error generating emotional wrap:', error);
        throw new Error('Failed to generate emotional wrap');
    }
};

export interface FeedbackInsight {
    topTools: Array<{ tool: string; effectiveness: number }>;
    recommendations: string[];
    patterns: string[];
}

export const generateFeedbackInsights = async (
    genAI: GoogleGenerativeAI,
    model: string,
    feedbackData: any[]
): Promise<FeedbackInsight> => {
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
    } catch (error) {
        console.error('Error generating feedback insights:', error);
        throw new Error('Failed to generate feedback insights');
    }
};
