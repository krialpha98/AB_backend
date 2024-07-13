import User from "../models/User.js";
import jwt from 'jsonwebtoken';
import { SECRET_ACCESS_TOKEN } from '../config/index.js';
import Blacklist from '../models/Blacklist.js';

export async function Verify(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(' ')[1]; // Extract token from header

    const checkIfBlacklisted = await Blacklist.findOne({ token });
    if (checkIfBlacklisted) {
        return res.status(401).json({ message: "This session has expired. Please login" });
    }

    jwt.verify(token, SECRET_ACCESS_TOKEN, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "This session has expired. Please login" });
        }

        const { id } = decoded;
        const user = await User.findById(id);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        const { password, ...data } = user._doc;
        req.user = data;
        next();
    });
}


export function VerifyRole(req, res, next) {
    try {
        const user = req.user;
        const { role } = user;
        if (role !== "0x88") {
            return res.status(401).json({
                status: "failed",
                message: "You are not authorized to view this page.",
            });
        }
        next();
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
        });
    }
}
