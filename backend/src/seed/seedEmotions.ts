import mongoose from "mongoose";
import Emotion from "../models/emotion";

require("dotenv").config();

const emotions = [
    // High Energy Unpleasant
    { title: "Angry", description: "Feeling strong displeasure or hostility", type: "High Energy Unpleasant", intensity: 8 },
    { title: "Frustrated", description: "Feeling upset due to inability to achieve something", type: "High Energy Unpleasant", intensity: 7 },
    { title: "Anxious", description: "Feeling worried and nervous about something uncertain", type: "High Energy Unpleasant", intensity: 7 },
    { title: "Stressed", description: "Feeling overwhelmed by demands or pressure", type: "High Energy Unpleasant", intensity: 8 },
    { title: "Panicked", description: "Feeling sudden uncontrollable fear or anxiety", type: "High Energy Unpleasant", intensity: 9 },
    { title: "Irritated", description: "Feeling slightly angry or annoyed", type: "High Energy Unpleasant", intensity: 5 },
    { title: "Overwhelmed", description: "Feeling buried under too many demands at once", type: "High Energy Unpleasant", intensity: 8 },
    { title: "Disgusted", description: "Feeling strong revulsion or disapproval", type: "High Energy Unpleasant", intensity: 7 },
    { title: "Jealous", description: "Feeling envious of someone else's advantages", type: "High Energy Unpleasant", intensity: 6 },
    { title: "Shocked", description: "Feeling disturbed by something unexpected and upsetting", type: "High Energy Unpleasant", intensity: 8 },
    { title: "Defensive", description: "Feeling the need to protect yourself from criticism", type: "High Energy Unpleasant", intensity: 6 },
    { title: "Agitated", description: "Feeling troubled and nervously excited", type: "High Energy Unpleasant", intensity: 7 },

    // Low Energy Unpleasant
    { title: "Sad", description: "Feeling sorrow or unhappiness", type: "Low Energy Unpleasant", intensity: 6 },
    { title: "Depressed", description: "Feeling persistently low and without hope", type: "Low Energy Unpleasant", intensity: 9 },
    { title: "Lonely", description: "Feeling isolated and without connection", type: "Low Energy Unpleasant", intensity: 7 },
    { title: "Bored", description: "Feeling uninterested and weary due to lack of stimulation", type: "Low Energy Unpleasant", intensity: 4 },
    { title: "Tired", description: "Feeling drained of energy and motivation", type: "Low Energy Unpleasant", intensity: 5 },
    { title: "Hopeless", description: "Feeling that nothing will improve or succeed", type: "Low Energy Unpleasant", intensity: 9 },
    { title: "Numb", description: "Feeling emotionally detached and unable to feel", type: "Low Energy Unpleasant", intensity: 7 },
    { title: "Disconnected", description: "Feeling detached from yourself or surroundings", type: "Low Energy Unpleasant", intensity: 6 },
    { title: "Guilty", description: "Feeling responsible for a wrongdoing or mistake", type: "Low Energy Unpleasant", intensity: 7 },
    { title: "Ashamed", description: "Feeling painful emotion from awareness of wrong or foolish behavior", type: "Low Energy Unpleasant", intensity: 8 },
    { title: "Grief-stricken", description: "Feeling deep sorrow especially from loss", type: "Low Energy Unpleasant", intensity: 9 },
    { title: "Apathetic", description: "Feeling lack of interest, enthusiasm, or concern", type: "Low Energy Unpleasant", intensity: 5 },

    // High Energy Pleasant
    { title: "Excited", description: "Feeling very enthusiastic and eager", type: "High Energy Pleasant", intensity: 9 },
    { title: "Happy", description: "Feeling joy and pleasure about your situation", type: "High Energy Pleasant", intensity: 8 },
    { title: "Enthusiastic", description: "Feeling intense enjoyment and interest", type: "High Energy Pleasant", intensity: 8 },
    { title: "Joyful", description: "Feeling great happiness and delight", type: "High Energy Pleasant", intensity: 9 },
    { title: "Energized", description: "Feeling full of vitality and ready to go", type: "High Energy Pleasant", intensity: 8 },
    { title: "Inspired", description: "Feeling mentally stimulated to do creative things", type: "High Energy Pleasant", intensity: 8 },
    { title: "Confident", description: "Feeling assured in your own abilities and choices", type: "High Energy Pleasant", intensity: 7 },
    { title: "Proud", description: "Feeling deep satisfaction from achievements", type: "High Energy Pleasant", intensity: 7 },
    { title: "Optimistic", description: "Feeling hopeful and confident about the future", type: "High Energy Pleasant", intensity: 7 },
    { title: "Playful", description: "Feeling lighthearted and inclined to have fun", type: "High Energy Pleasant", intensity: 7 },
    { title: "Grateful", description: "Feeling thankful and appreciative of what you have", type: "High Energy Pleasant", intensity: 8 },
    { title: "Elated", description: "Feeling ecstatically happy and overjoyed", type: "High Energy Pleasant", intensity: 10 },

    // Low Energy Pleasant
    { title: "Calm", description: "Feeling peaceful and free from agitation", type: "Low Energy Pleasant", intensity: 5 },
    { title: "Relaxed", description: "Feeling free from tension and anxiety", type: "Low Energy Pleasant", intensity: 5 },
    { title: "Content", description: "Feeling satisfied and at peace with your situation", type: "Low Energy Pleasant", intensity: 6 },
    { title: "Peaceful", description: "Feeling serene and untroubled", type: "Low Energy Pleasant", intensity: 5 },
    { title: "Comforted", description: "Feeling soothed and reassured", type: "Low Energy Pleasant", intensity: 6 },
    { title: "Cozy", description: "Feeling warm, comfortable and at ease", type: "Low Energy Pleasant", intensity: 5 },
    { title: "Tender", description: "Feeling gentle warmth and affection", type: "Low Energy Pleasant", intensity: 6 },
    { title: "Safe", description: "Feeling protected and free from danger or worry", type: "Low Energy Pleasant", intensity: 6 },
    { title: "Meditative", description: "Feeling deeply reflective and at one with yourself", type: "Low Energy Pleasant", intensity: 4 },
    { title: "Nostalgic", description: "Feeling bittersweet longing for the past", type: "Low Energy Pleasant", intensity: 5 },
    { title: "Hopeful", description: "Feeling quietly optimistic about what may come", type: "Low Energy Pleasant", intensity: 6 },
    { title: "Serene", description: "Feeling utterly calm and unruffled", type: "Low Energy Pleasant", intensity: 4 },
];

async function seed() {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
        console.error("MONGODB_URI not set in environment");
        process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    let inserted = 0;
    let skipped = 0;

    for (const emotionData of emotions) {
        const existing = await Emotion.findOne({ title: emotionData.title });
        if (existing) {
            skipped++;
            continue;
        }
        await Emotion.create(emotionData);
        inserted++;
    }

    console.log(`Seeding complete: ${inserted} inserted, ${skipped} already existed`);
    await mongoose.disconnect();
}

seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
