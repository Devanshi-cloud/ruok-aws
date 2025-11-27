"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editProfileValidation = exports.logInValidation = exports.signupValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.signupValidation = joi_1.default.object({
    firstName: joi_1.default.string().min(2).max(30).required(),
    lastName: joi_1.default.string().min(2).max(30).optional().allow(""),
    photoURL: joi_1.default.string().uri().optional().allow(""),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required(),
});
exports.logInValidation = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required(),
});
const editProfileValidation = (req) => {
    const allowedEditFields = ["firstName", "lastName", "photoUrl", "bio"];
    return Object.keys(req.body).every((field) => allowedEditFields.includes(field));
};
exports.editProfileValidation = editProfileValidation;
