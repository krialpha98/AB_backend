import User from "../models/User.js";
import jwt from 'jsonwebtoken';
import { SECRET_ACCESS_TOKEN } from '../config/index.js';
import Blacklist from '../models/Blacklist.js';

export async function Verify(req, res, next) {
    const authHeader = req.headers["cookie"];
    if (!authHeader) {
        console.log("No cookie found");
        return res.sendStatus(401);
    }

    const cookie = authHeader.split("=")[1];
    const accessToken = cookie.split(";")[0];
    console.log("Access token:", accessToken);

    const checkIfBlacklisted = await Blacklist.findOne({ token: accessToken });
    if (checkIfBlacklisted) {
        console.log("Token is blacklisted");
        return res.status(401).json({ message: "This session has expired. Please login" });
    }

    jwt.verify(accessToken, SECRET_ACCESS_TOKEN, async (err, decoded) => {
        if (err) {
            console.log("Token verification failed:", err.message);
            return res.status(401).json({ message: "This session has expired. Please login" });
        }

        console.log("Decoded token:", decoded);

        const { id } = decoded;
        const user = await User.findById(id);
        if (!user) {
            console.log("User not found");
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
