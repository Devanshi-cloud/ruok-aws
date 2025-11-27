"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ghq_1 = __importDefault(require("../models/ghq"));
const router = (0, express_1.Router)();
router.post('/submit', async (req, res) => {
    try {
        const newEntry = new ghq_1.default(req.body);
        await newEntry.save();
        res.status(201).json({ message: 'GHQ form submitted successfully!', entry: newEntry });
    }
    catch (error) {
        console.error('Error saving GHQ entry:', error);
        res.status(500).json({ message: 'Error submitting form', error: error.message });
    }
});
router.get('/', async (req, res) => {
    try {
        const entries = await ghq_1.default.find();
        res.status(200).json(entries);
    }
    catch (error) {
        console.error('Error fetching GHQ entries:', error);
        res.status(500).json({ message: 'Error fetching entries', error: error.message });
    }
});
exports.default = router;
