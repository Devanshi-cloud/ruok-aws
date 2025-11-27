"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const booking_1 = require("../models/booking");
const user_1 = __importDefault(require("../models/user"));
const userAuth_1 = __importDefault(require("../middleware/userAuth"));
const router = express_1.default.Router();
// routes/therapists.ts (or wherever your route is)
router.get('/therapists', userAuth_1.default, async (req, res) => {
    try {
        const users = await user_1.default.find({ role: 'therapist' }).lean();
        const therapists = users.map((u) => {
            const name = u.name ?? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
            return {
                _id: u._id,
                name,
                email: u.email,
                photoUrl: u.avatar ?? u.photoUrl ?? null,
                specialization: u.specialization ?? null,
                bio: u.bio ?? null,
            };
        });
        res.status(200).json(therapists);
    }
    catch (error) {
        console.error('Error fetching therapists:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.get('/therapists/:therapistId/availability', userAuth_1.default, async (req, res) => {
    const { therapistId } = req.params;
    const { date } = req.query;
    if (!date) {
        return res.status(400).json({ message: 'Date parameter is required' });
    }
    try {
        const therapist = await user_1.default.findById(therapistId);
        if (!therapist || therapist.role !== 'therapist') {
            return res.status(404).json({ message: 'Therapist not found' });
        }
        const requestedDate = new Date(date);
        const existingBookings = await booking_1.Booking.find({
            therapistId,
            date: {
                $gte: new Date(requestedDate.setHours(0, 0, 0, 0)),
                $lt: new Date(requestedDate.setHours(23, 59, 59, 999)),
            },
            status: { $in: ['pending', 'confirmed'] } // Consider pending and confirmed as taken
        });
        const bookedTimeSlots = existingBookings.map(booking => booking.timeSlot);
        const allPossibleTimeSlots = [
            "09:00 am", "10:00 am", "11:00 am", "12:00 pm",
            "01:00 pm", "02:00 pm", "03:00 pm", "04:00 pm", "05:00 pm"
        ];
        const availableTimeSlots = allPossibleTimeSlots.filter(slot => !bookedTimeSlots.includes(slot));
        res.status(200).json({ availability: availableTimeSlots });
    }
    catch (error) {
        console.error('Error fetching therapist availability:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.post('/bookings', userAuth_1.default, async (req, res) => {
    const { therapistId, date, timeSlot } = req.body;
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = req.user._id;
    if (!therapistId || !date || !timeSlot) {
        return res.status(400).json({ message: 'Missing required booking details' });
    }
    try {
        const therapist = await user_1.default.findById(therapistId);
        if (!therapist || therapist.role !== 'therapist') {
            return res.status(404).json({ message: 'Therapist not found' });
        }
        const bookingDate = new Date(date);
        if (isNaN(bookingDate.getTime())) {
            return res.status(400).json({ message: 'Invalid date format' });
        }
        const existingBooking = await booking_1.Booking.findOne({
            therapistId,
            date: {
                $gte: new Date(bookingDate.setHours(0, 0, 0, 0)),
                $lt: new Date(bookingDate.setHours(23, 59, 59, 999)),
            },
            timeSlot,
            status: { $in: ['pending', 'confirmed'] }
        });
        if (existingBooking) {
            return res.status(409).json({ message: 'This slot is already booked.' });
        }
        const newBooking = new booking_1.Booking({
            therapistId,
            userId,
            date: bookingDate,
            timeSlot,
            status: 'pending',
        });
        await newBooking.save();
        res.status(201).json({ message: 'Booking created successfully!', booking: newBooking });
    }
    catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
