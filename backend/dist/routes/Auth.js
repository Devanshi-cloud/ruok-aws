"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const user_1 = __importDefault(require("../models/user"));
const validations_1 = require("../utils/validations");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userAuth_1 = __importDefault(require("../middleware/userAuth"));
const google_auth_library_1 = require("google-auth-library");
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
router.post('/signup', async (req, res) => {
    //validating inputs from req.body
    const { error } = validations_1.signupValidation.validate(req.body);
    if (error) {
        return res.status(411).json({ message: error.details[0].message });
    }
    const { firstName, email, password } = req.body;
    try {
        //finding existing user in db
        const existingUser = await user_1.default.findOne({ email: email });
        if (existingUser) {
            return res.status(403).json({ message: 'User already exists' });
        }
        const passwordHash = await bcrypt_1.default.hash(password, 10);
        const newUser = new user_1.default({
            firstName: firstName,
            email: email,
            password: passwordHash
        });
        await newUser.save();
        //creating jwt token for the new user , expires  in 1 day
        const token = jsonwebtoken_1.default.sign({ _id: newUser._id }, process.env.JWT_KEY, { expiresIn: '1d' });
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/',
            maxAge: 3600000 * 24
        });
        const userObj = newUser.toObject();
        delete userObj.password;
        return res.status(201).json({ message: 'User created successfully', user: userObj });
    }
    catch (err) {
        console.error("Signup Error:", err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
router.post('/login', async (req, res) => {
    //validating body
    const { error } = validations_1.logInValidation.validate(req.body);
    if (error) {
        return res.status(411).json({ message: error.details[0].message });
    }
    const { email, password } = req.body;
    try {
        //check if the user  exists
        const user = await user_1.default.findOne({ email: email });
        if (!user) {
            return res.status(403).json({ message: 'Invalid Credentials' });
        }
        // If the user exists but doesn't have a password (e.g., signed up with Google)
        if (!user.password) {
            return res.status(403).json({ message: 'Please log in with Google' });
        }
        //validate password
        const isValidPassword = await bcrypt_1.default.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(403).json({ message: 'Invalid Credentials' });
        }
        //create jwt token
        const token = jsonwebtoken_1.default.sign({ _id: user._id }, process.env.JWT_KEY, { expiresIn: '1d' });
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/',
            maxAge: 3600000 * 24
        });
        const userObj = user.toObject();
        delete userObj.password;
        res.status(200).json({ message: 'User logged in successfully', user: userObj });
    }
    catch (err) {
        console.error("Login Error:", err); // Changed "Signup Error" to "Login Error" for clarity
        return res.status(500).json({ message: 'Internal server error' });
    }
});
router.post('/google-auth', async (req, res) => {
    try {
        const { credential } = req.body; //google id
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        const { email, given_name, family_name, picture } = payload;
        let user = await user_1.default.findOne({ email });
        if (!user) {
            user = new user_1.default({
                firstName: given_name,
                lastName: family_name,
                email: email,
                photoUrl: picture,
                isGoogleAuth: true
            });
            await user.save();
        }
        const token = jsonwebtoken_1.default.sign({ _id: user._id }, process.env.JWT_KEY, { expiresIn: '1d' });
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/',
            maxAge: 3600000 * 24
        });
        const userObj = user.toObject();
        delete userObj.password;
        res.status(200).json({ message: 'Google login successful', user: userObj });
    }
    catch (error) {
        console.error('Google auth error:', error);
        res.status(401).json({ message: 'Invalid Google token' });
    }
});
router.post('/guest-login', async (req, res) => {
    try {
        const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const guestUser = new user_1.default({
            firstName: 'Guest',
            lastName: 'User',
            email: `${guestId}@guest.temp`,
            password: await bcrypt_1.default.hash(guestId, 10),
            bio: "Guest user account",
            isGuest: true
        });
        await guestUser.save();
        const token = jsonwebtoken_1.default.sign({ _id: guestUser._id, isGuest: true }, process.env.JWT_KEY, { expiresIn: '1h' } // Shorter expiration for guests
        );
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/',
            maxAge: 3600000 // 1 hour
        });
        const userObj = guestUser.toObject();
        delete userObj.password;
        res.status(200).json({
            message: 'Guest login successful',
            user: userObj,
            isGuest: true
        });
    }
    catch (err) {
        console.error("Signup Error:", err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
router.delete('/delete-guest', userAuth_1.default, async (req, res) => {
    try {
        const userId = req.user._id;
        const isValidUser = await user_1.default.findByIdAndDelete(userId);
        if (!isValidUser) {
            return res.status(404).json({ message: 'Invalid Credentials' });
        }
        res.cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/'
        });
        return res.status(200).json({ message: 'User deleted successfully' });
    }
    catch (err) {
        console.error("Error Deleting guest", err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
router.post('/logout', async (req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now())
    });
    res.send({ message: 'Logged out successfully' });
});
exports.default = router;
