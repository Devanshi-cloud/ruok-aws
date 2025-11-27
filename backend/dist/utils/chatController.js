"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSageChat = void 0;
const generative_ai_1 = require("@google/generative-ai");
const elevenlabs_js_1 = require("@elevenlabs/elevenlabs-js");
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = require("path");
const promises_1 = require("stream/promises");
dotenv_1.default.config();
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
const voiceID = '21m00Tcm4TlvDq8ikWAM';
const elevenLabs = new elevenlabs_js_1.ElevenLabsClient();
const execCommand = (command) => {
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(command, (error, stdout) => {
            if (error)
                reject(error);
            resolve(stdout);
        });
    });
};
const lipSyncMessage = async (baseFileName) => {
    const mp3Path = (0, path_1.join)(process.cwd(), 'audios', `${baseFileName}.mp3`);
    const wavPath = (0, path_1.join)(process.cwd(), 'audios', `${baseFileName}.wav`);
    const jsonPath = (0, path_1.join)(process.cwd(), 'audios', `${baseFileName}.json`);
    const rhubarbPath = (0, path_1.join)(process.cwd(), 'bin', 'rhubarb');
    await execCommand(`ffmpeg -y -i "${mp3Path}" "${wavPath}"`);
    await execCommand(`"${rhubarbPath}" -f json -o "${jsonPath}" "${wavPath}" -r phonetic`);
};
const audioFileToBase64 = async (file) => {
    const data = await fs_1.promises.readFile(file);
    return data.toString('base64');
};
const readJsonTranscript = async (file) => {
    const data = await fs_1.promises.readFile(file, 'utf8');
    return JSON.parse(data);
};
const handleSageChat = async (req, res) => {
    let { message: userMessage, dayCheckIns, feedbacks, chatHistory } = req.body;
    if (!userMessage) {
        return res.status(400).json({ message: "Message is required" });
    }
    if (!elevenLabsApiKey || !process.env.GEMINI_API_KEY) {
        return res.status(400).json({ error: 'API keys are missing.' });
    }
    try {
        if (userMessage === "INITIAL_GREETING_NO_CHECKIN") {
            const text = "Hey there! Before we start, could you do a quick emotional check-in so I can understand you better?";
            const facialExpression = "smile";
            const animation = "Talking_1";
            const fileName = (0, path_1.join)(process.cwd(), 'audios', 'initial_greeting.mp3');
            const audioStream = await elevenLabs.textToSpeech.convert(voiceID, {
                text,
                modelId: "eleven_multilingual_v2",
            });
            const fileWriteStream = (0, fs_1.createWriteStream)(fileName);
            await (0, promises_1.pipeline)(audioStream, fileWriteStream);
            await lipSyncMessage('initial_greeting');
            const audio = await audioFileToBase64(fileName);
            const lipsync = await readJsonTranscript((0, path_1.join)(process.cwd(), 'audios', 'initial_greeting.json'));
            return res.json({
                messages: [{ id: `msg_${Date.now()}`, text, audio, lipsync, facialExpression, animation }],
            });
        }
        else if (userMessage === "INITIAL_GREETING_WITH_CHECKIN") {
            userMessage = "Start the conversation by greeting me warmly based on my latest emotional check-in.";
        }
        const emotionalContext = `Current emotional context:\n${JSON.stringify(dayCheckIns, null, 2)}`;
        const feedbackHistory = `Feedback history:\n${JSON.stringify(feedbacks, null, 2)}`;
        //TODO:Add tools context here
        const systemInstruction = `
            You are a compassionate CBT-style AI therapist named 'Sage'.

        Always be empathetic, understanding, and respond like a warm friend and therapist.
        Never mention you're an AI or that this is a simulation.
        Respond in a way that balances professionalism with empathy and friendliness, adapting to the user's tone.
        You should:
        • Offer emotional support, validation, and reflective listening like a therapist.
        • Act as a non-judgmental friend when the user seems casual, venting, or confused.
        • Understand and interpret Gen Z / Gen Alpha slang, abbreviations, and informal language without explaining them or making the user feel self-conscious.
        • Avoid using slang or abbreviations unless the user uses them first. Match their communication style naturally.
        • Ask thoughtful, open-ended questions to help users reflect.
        • Respect emotional boundaries and avoid offering medical diagnoses or medication advice.
        • Keep responses clear, warm, concise, and emotionally intelligent.
        • Suggest specific tools from the provided list when relevant, based on the user's current emotional state and past feedback, using conversational phrasing.
        • Never mention that you're an AI unless specifically asked.

        Examples of emotional tones to understand:
        "idk wtf is wrong with me" → Respond gently, validate feelings, and ask what's been going on.
        "bruh i messed up again lmao" → Respond casually, non-judgmentally, and offer supportive insight.
        "i'm just tired of everything. nothing makes sense anymore." → Respond with care, reflect feelings, and guide toward deeper exploration or grounding exercises.

        Feedback history:\n
        ${feedbackHistory}
        
        Your task is to:
        1. Respond to the user's input with empathy, validating their feelings and offering support.
        2. Analyze the feedback history to find the highest-rated tool for:
           - The specific emotion in the latest check-in (if available).
           - The emotion type in the latest check-in (if available).
           - The activity tag in the latest check-in (if present).
           - The place tag in the latest check-in (if present).
           - The people tag in the latest check-in (if present).
        3. Provide tailored tool suggestions for the latest check-in, phrased conversationally:
           - For the emotion: "Whenever you felt [emotion] and used [tool], it worked out great for you. Try it again!"
           - For the emotion type: "Whenever you felt [emotion type] emotions and used [tool], you felt better. Try it now to feel better!"
           - For activity (if tag present): "Whenever you felt [emotion type] emotions doing [activity] and used [tool], you felt better. Try it now to feel better!"
           - For place (if tag present): "Whenever you felt [emotion type] emotions at [place] and used [tool], you felt better. Try it now to feel better!"
           - For people (if tag present): "Whenever you felt [emotion type] emotions with [people] and used [tool], you felt better. Try it now to feel better!"
        4. If no feedback exists for a specific context, recommend a tool from the same emotion type category as the latest check-in, using the same phrasing.
        5. Omit suggestions for activity, place, or people if their tags are null in the latest check-in.
        6. Integrate suggestions naturally into the response, only when relevant to the user's input.

        

        Example response format:
        I hear that you're feeling really overwhelmed right now.\\nThat sounds incredibly tough, and it's okay to feel this way sometimes.\\nWhenever you felt Sad and used Journaling, it worked out great for you. Try it again!\\nCan you share a bit more about what's been going on?

        Current emotional context:
        ${emotionalContext}
        `;
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            systemInstruction
        });
        const chat = model.startChat({
            history: chatHistory.map(msg => ({
                role: msg.from === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }],
            })),
        });
        const result = await chat.sendMessage(userMessage);
        const sageTextResponse = result.response.text();
        if (!sageTextResponse) {
            return res.status(400).json({ message: "Failed to process chat message." });
        }
        // Analyze the text for emotion and animation
        const analysisPrompt = `
        Analyze the therapist's text: "${sageTextResponse}"
        Choose the best facial expression from: smile, sad, angry, surprised, default.
        Choose the best animation from: Talking_0, Talking_1, Crying, Laughing, Idle.
        Respond with only a JSON object containing "facialExpression" and "animation" keys.`;
        const analysisModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const analysisResult = await analysisModel.generateContent({
            contents: [{ role: "user", parts: [{ text: analysisPrompt }] }],
            generationConfig: { responseMimeType: "application/json" },
        });
        if (!analysisResult.response) {
            return res.status(400).json({ message: "Failed to analyze text." });
        }
        const { facialExpression, animation } = JSON.parse(analysisResult.response.text());
        //generate audio and lipsync
        const baseFileName = 'message_0';
        const fileName = (0, path_1.join)(process.cwd(), 'audios', `${baseFileName}.mp3`);
        const audioStream = await elevenLabs.textToSpeech.convert(voiceID, {
            text: sageTextResponse,
            modelId: "eleven_multilingual_v2",
        });
        if (!audioStream) {
            return res.status(400).json({ message: "Failed to process chat message. Eleven Labs API returned no audio stream." });
        }
        const fileWriteStream = (0, fs_1.createWriteStream)(fileName);
        await (0, promises_1.pipeline)(audioStream, fileWriteStream);
        await lipSyncMessage(baseFileName);
        const audio = await audioFileToBase64(fileName);
        const lipsync = await readJsonTranscript(`audios/message_0.json`);
        //send the complete response back
        res.json({
            messages: [{
                    id: `msg_${Date.now()}`,
                    text: sageTextResponse,
                    audio,
                    lipsync,
                    facialExpression,
                    animation,
                }],
        });
    }
    catch (error) {
        console.error('Error in chat handler:', error);
        res.status(500).json({ error: 'Failed to process chat message.' });
    }
};
exports.handleSageChat = handleSageChat;
