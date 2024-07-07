import express from "express";
import {
  createThread,
  addMessage,
  listMessages,
  createRun,
  cancelRun,
  getRunSteps,
  getRunStatus,
} from "../controllers/assistant.js";
import { Verify } from "../middleware/verify.js";
import Thread from "../models/Thread.js";

const router = express.Router();

router.post("/create-thread", Verify, createThread);
router.post("/add-message", Verify, addMessage);
router.get('/thread/:threadId/run/:runId/status', Verify, getRunStatus);
router.get('/thread/:threadId/run/:runId/steps', Verify, getRunSteps);
router.post('/thread/:threadId/run/:runId/cancel', Verify, cancelRun);
router.get("/threads/:threadId/messages", Verify, listMessages);
router.post("/threads/:threadId/runs", Verify, createRun);

// New route to get conversation history
router.get("/conversation-history", Verify, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const threads = await Thread.find({ userEmail })
      .sort({ lastInteraction: -1 })
      .limit(20);
    res.status(200).json(threads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
