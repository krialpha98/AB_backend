import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import UserWhitelist from "../models/UserWhitelist.js";  // Import the UserWhitelist model
import Blacklist from "../models/Blacklist.js";
import { SECRET_ACCESS_TOKEN } from "../config/index.js";
import { validationResult } from "express-validator";

export async function Register(req, res) {
    console.log("Request body:", req.body); // Log the incoming request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        return res.status(422).json({ message: "Password must be at least 8 characters long." });
    }

    const { first_name, last_name, email, password } = req.body;

    try {
        console.log("Checking whitelist for email:", email); // Debug log
        const whitelistedUser = await UserWhitelist.findOne({ email });
        if (!whitelistedUser) {
            console.log("Email not in whitelist:", email); // Debug log
            return res.status(403).json({
                status: "failed",
                message: "You are not allowed to register with this email address.",
            });
        }

        console.log("Email is whitelisted:", email); // Debug log
        const newUser = new User({
            first_name,
            last_name,
            email,
            password,
        });

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("Existing user found:", existingUser); // Debug log
            return res.status(400).json({
                status: "failed",
                message: "It seems you already have an account, please log in instead.",
            });
        }

        const savedUser = await newUser.save();
        const { role, ...user_data } = savedUser._doc;

        res.status(200).json({
            status: "success",
            data: [user_data],
            message: "Thank you for registering with us. Your account has been successfully created.",
        });
    } catch (err) {
        console.error('Error saving user:', err);
        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
        });
    }
    res.end();
}

export async function Login(req, res) {
    const { email, password } = req.body;

    // Log the received credentials
    console.log("Received email:", email);
    console.log("Received password:", password);

    try {
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            console.log("User not found"); // Log user not found
            return res.status(401).json({
                status: "failed",
                message: "Account does not exist",
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log("Invalid password"); // Log invalid password
            return res.status(401).json({
                status: "failed",
                message: "Invalid email or password. Please try again with the correct credentials.",
            });
        }

        let options = {
            maxAge: 20 * 60 * 1000, // 20 minutes
            httpOnly: true,         // Accessible only by web server
            secure: true,           // HTTPS only
            sameSite: "None",       // Allow cross-site cookies
        };

        const token = jwt.sign({ id: user._id }, SECRET_ACCESS_TOKEN, { expiresIn: '20m' });
        res.cookie("SessionID", token, options);
        res.status(200).json({
            status: "success",
            message: "You have successfully logged in.",
            user: {
                id: user._id,
                name: user.first_name + " " + user.last_name,
                email: user.email
            }
        });
    } catch (err) {
        console.log("Error:", err); // Log the error
        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
        });
    }
    res.end();
}

export async function Logout(req, res) {
    try {
        const token = req.cookies["SessionID"];
        if (!token) {
            console.log("Token not found in cookies");
            return res.status(401).json({ message: "Unauthorized" });
        }

        const checkIfBlacklisted = await Blacklist.findOne({ token });
        if (checkIfBlacklisted) {
            console.log("Token is blacklisted");
            return res.sendStatus(204);
        }

        const newBlacklist = new Blacklist({ token });
        await newBlacklist.save();
        
        res.clearCookie("SessionID");
        res.status(200).json({ message: 'You are logged out!' });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
        });
    }
    res.end();
}

export function validateToken(req, res) {
    const token = req.cookies["SessionID"];
    if (!token) {
        return res.status(401).json({ status: "failed", message: "No token provided" });
    }

    jwt.verify(token, SECRET_ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(401).json({ status: "failed", message: "Invalid token" });
        }
        res.status(200).json({ status: "success", message: "Token is valid" });
    });
}
