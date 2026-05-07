import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    firstName: string;
    lastName?: string;
    email: string;
    bio?: string;
    photoUrl?: string;
    isGuest: boolean;
    isGoogleAuth: boolean;
    password?: string;
    geminiApiKey?: string;
    geminiModel?: string;
    createdAt: Date;
    updatedAt: Date;
    role: 'user' | 'therapist' | 'admin';
}

const UserSchema = new Schema<IUser>(
    {
        firstName: { type: String, required: true },
        lastName: { type: String },
        email: { type: String, required: true },
        bio: { type: String },
        photoUrl: {
            type: String,
            default: "/avatars/default.png",  // Use relative path instead of full URL
        },
        isGuest: { type: Boolean, default: false },
        isGoogleAuth: { type: Boolean, default: false },
        password: {
            type: String,
            required: function (this: IUser) {
                return !this.isGoogleAuth;
            },
        },
        role: { 
            type: String, 
            enum: ['user', 'therapist', 'admin'], 
            default: 'user',
            required: true 
        },
        geminiApiKey: {
            type: String,
            default: null,
            select: false, // Don't return this by default for security
        },
        geminiModel: {
            type: String,
            default: 'gemini-2.0-flash',
        },
    },{ timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
