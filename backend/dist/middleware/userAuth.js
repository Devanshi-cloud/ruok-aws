"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user"));
const userAuth = async (req, res, next) => {
    try {
        //read token from cookies
        const { token } = req.cookies;
        //validate token
        if (!token) {
            throw new Error("Token not found");
        }
        //get id from token and check user
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_KEY);
        const user = await user_1.default.findById(decoded._id);
        if (!user) {
            throw new Error("User not found");
        }
        //set user in req object and pass control to next middleware
        req.user = user;
        next();
    }
    catch (err) {
        res.status(401).send(err.message);
    }
};
exports.default = userAuth;
