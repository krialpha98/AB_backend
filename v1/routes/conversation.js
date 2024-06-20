import express from "express";
import { initializeConversation } from "../controllers/conversation.js";
import { Verify } from "../middleware/verify.js";

const router = express.Router();

router.post("/init", Verify, initializeConversation);

export default router;
