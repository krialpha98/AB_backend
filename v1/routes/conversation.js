import express from "express";
import { initializeConversation } from "../controllers/conversation.js";
import { Verify } from "../middleware/verify.js";

const router = express.Router();

// Define a POST route at /init
// Apply the Verify middleware to ensure only authenticated requests can access this route
router.post("/init", Verify, initializeConversation);

export default router;
