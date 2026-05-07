import { useState, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import type {CheckIn, Feedback} from "@/utils/types.ts";

function hashData(feedbacks: Feedback[], latestCheckIn: CheckIn | null) {
    const feedbackHash = JSON.stringify(
        feedbacks.map(({ toolName, rating, checkIn }) => ({
            toolName,
            rating,
            checkIn: {
                emotion: checkIn?.emotion || { title: "", type: "" },
                description: checkIn?.description || null,
                activityTag: checkIn?.activityTag || null,
                placeTag: checkIn?.placeTag || null,
                peopleTag: checkIn?.peopleTag || null,
            },
        }))
    );
    const checkInHash = latestCheckIn
        ? JSON.stringify({
            emotion: latestCheckIn.emotion,
            description: latestCheckIn.description || null,
            activityTag: latestCheckIn.activityTag || null,
            placeTag: latestCheckIn.placeTag || null,
            peopleTag: latestCheckIn.peopleTag || null,
        })
        : "";
    return feedbackHash + checkInHash;
}

export default function useGetFeedbackInsight() {
    const [insight, setInsight] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const lastHashRef = useRef<string | null>(null);

    const feedbacks = useSelector(
        (state: { feedback: Feedback[] | null }) => state.feedback || []
    );
    const latestCheckIn = useSelector(
        (state: { checkIns: { latestCheckIn: CheckIn | null } }) => state.checkIns.latestCheckIn
    );

    const getInsight = useMemo(
        () =>
            async function () {
                setError("");

                if (!latestCheckIn) {
                    setError("No recent check-in found to generate suggestions.");
                    return;
                }

                if (!feedbacks || feedbacks.length === 0) {
                    setError("No feedback available. Please provide feedback on tools to receive tailored suggestions.");
                    return;
                }

                const currentHash = hashData(feedbacks, latestCheckIn);

                if (lastHashRef.current === currentHash && insight) return;

                setLoading(true);

                try {
                    const response = await fetch('/api/ai/insights', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                    });

                    if (!response.ok) {
                        const data = await response.json();
                        throw new Error(data.error || 'Failed to generate insights');
                    }

                    const data = await response.json();
                    setInsight(data);
                    lastHashRef.current = currentHash;
                } catch (err: any) {
                    console.error("Error fetching insight:", err);
                    if (err.message?.includes('not configured')) {
                        setError("Please add your Gemini API key in settings.");
                    } else if (err.message?.includes('quota')) {
                        setError("API quota exceeded. Please try again later.");
                    } else {
                        setError("Failed to generate insight: " + err.message);
                    }
                } finally {
                    setLoading(false);
                }
            },
        [feedbacks, latestCheckIn]
    );

    return { insight, loading, error, getInsight };
}