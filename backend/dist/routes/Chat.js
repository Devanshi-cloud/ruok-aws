"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatController_1 = require("../utils/chatController");
const router = (0, express_1.Router)();
router.post('/', chatController_1.handleSageChat);
exports.default = router;
