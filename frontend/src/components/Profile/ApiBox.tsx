import { Input } from "../ui/input";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import {type ChangeEvent, useEffect, useState} from "react";
import {useSelector} from "react-redux";
import type {User} from "@/utils/types.ts";
import mixpanelService from "@/services/MixpanelService.ts";

const ApiBox = () => {

    const user = useSelector((state: { user: User | null }) => state.user);
    const [isGuest, setIsGuest] = useState(false);
    const [apiKey, setApiKey] = useState<string>('');
    const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash');
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    useEffect(() => {
        if(user?.isGuest){
            setIsGuest(true);
        }
    }, [user]);

    const handleApiKeyChange = (e:ChangeEvent<HTMLInputElement>) => {
        const newApiKey = e.target.value;
        setApiKey(newApiKey);
        setSaveMessage('');
    };

    const handleModelChange = (value:string) => {
        setSelectedModel(value);
        setSaveMessage('');
    };

    const handleSaveSettings = async () => {
        if (!apiKey.trim()) {
            setSaveMessage('Please enter an API key');
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch('/api/ai/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    apiKey: apiKey.trim(),
                    model: selectedModel,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                setSaveMessage(`Error: ${data.error || 'Failed to save settings'}`);
                return;
            }

            setSaveMessage('✓ Settings saved successfully');
            mixpanelService.trackButtonClick('Gemini API settings saved', { location: 'Profile' });
            
            // Clear message after 3 seconds
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
            setSaveMessage('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-zinc-100 dark:bg-zinc-950 border-2 rounded-3xl p-6 w-full md:w-1/2 flex flex-col items-center gap-6">

            <Input
                type="password"
                placeholder="Enter Gemini API Key"
                className="w-full max-w-md"
                value={apiKey}
                onChange={handleApiKeyChange}
                disabled={isGuest}
            />

            <Select value={selectedModel} disabled={isGuest} onValueChange={handleModelChange}>
                <SelectTrigger className="w-full max-w-md">
                    <SelectValue placeholder="Select Gemini Model" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="gemini-2.5-flash-preview-04-17">Gemini 2.5 Flash (Preview)</SelectItem>
                    <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash</SelectItem>
                    <SelectItem value="gemini-2.0-flash-lite">Gemini 2.0 Flash-Lite</SelectItem>
                </SelectContent>
            </Select>

            <button
                onClick={handleSaveSettings}
                disabled={isGuest || isSaving}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSaving ? 'Saving...' : 'Save Settings'}
            </button>

            {saveMessage && (
                <p className={`text-sm ${saveMessage.includes('✓') ? 'text-green-600' : 'text-red-600'}`}>
                    {saveMessage}
                </p>
            )}
        </div>
    );
};

export default ApiBox;
