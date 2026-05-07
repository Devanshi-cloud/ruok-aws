import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import type { CheckIn } from "@/utils/types.ts";

function hashCheckins(checkins: CheckIn[]) {
    return JSON.stringify(
        checkins.map(({ emotion, description, activityTag, placeTag, peopleTag }) => ({
            emotion,
            description,
            activityTag,
            placeTag,
            peopleTag,
        }))
    );
}

export default function useGetWrap() {
    const [insight, setInsight] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const lastHashRef = useRef<string | null>(null);

    const checkins = useSelector(
        (state: { checkIns: { allCheckIns: CheckIn[] | null } }) =>
            state.checkIns.allCheckIns
    );

    async function getInsight(): Promise<void> {
        setError("");

        if (!checkins || checkins.length === 0) {
            setError("Please add some check-ins to access this feature to full potential.");
            return;
        }

        const currentHash = hashCheckins(checkins);

        if (lastHashRef.current === currentHash && insight) return;

        setLoading(true);

        try {
            const response = await fetch('/api/ai/generate-wrap', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            // Check if response is OK
            if (!response.ok) {
                const contentType = response.headers.get('content-type');
                let errorMessage = `HTTP ${response.status}`;
                
                if (contentType && contentType.includes('application/json')) {
                    try {
                        const data = await response.json();
                        errorMessage = data.error || errorMessage;
                    } catch {
                        errorMessage = `HTTP ${response.status}: Invalid response`;
                    }
                } else {
                    const text = await response.text();
                    errorMessage = text || errorMessage;
                }
                
                throw new Error(errorMessage);
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
    }

    return { insight, loading, error, getInsight };
}