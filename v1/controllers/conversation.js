import Conversation from "../models/Conversation.js";
import { v4 as uuidv4 } from "uuid";

/**
 * @route POST v1/conversation/init
 * @desc Initializes a new conversation
 * @access Private
 */
export async function initializeConversation(req, res) {
    try {
        const thread_id = uuidv4(); // Generate a unique thread ID
        const user_id = req.user._id; // Get user ID from the request (assuming user is authenticated)

        const newConversation = new Conversation({
            thread_id,
            user: user_id,
        });

        await newConversation.save();

        res.status(201).json({
            status: "success",
            data: { thread_id },
            message: "Conversation initialized successfully.",
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
        });
    }
}
