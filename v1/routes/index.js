import express from "express";
import Auth from "./auth.js";
import Conversation from "./conversation.js"; // Ensure you import other route files
import { Verify, VerifyRole } from "../middleware/verify.js";

const router = express.Router();

router.disable("x-powered-by");

router.get("/", (req, res) => {
    try {
        res.status(200).json({
            status: "success",
            message: "Welcome to our API homepage!",
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
        });
    }
});

// Authentication routes should not require the Verify middleware
router.use("/auth", Auth);

// Apply Verify middleware to all routes defined after this point
router.use(Verify);

router.get("/user", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Welcome to your Dashboard!",
    });
});

router.get("/admin", VerifyRole, (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Welcome to the Admin portal!",
    });
});

// Mount the Conversation router under /conversation path
router.use("/conversation", Conversation);

export default router;
