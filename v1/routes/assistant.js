import express from "express";
import {
  createThread,
  addMessage,
  listMessages,
  createRun,
  cancelRun,
  getRunSteps,
  getRunStatus,
  getLastThreads // Import the new controller function
} from "../controllers/assistant.js";
import { Verify } from "../middleware/verify.js";

const router = express.Router();

router.post("/create-thread", Verify, createThread);
router.post("/add-message", Verify, addMessage);
router.get('/thread/:threadId/run/:runId/status', Verify, getRunStatus);
router.get('/thread/:threadId/run/:runId/steps', Verify, getRunSteps);
router.post('/thread/:threadId/run/:runId/cancel', Verify, cancelRun);
router.get("/threads/:threadId/messages", Verify, listMessages);
router.post("/threads/:threadId/runs", Verify, createRun);

// New route for fetching the last 20 threads with chat names for the user
router.get("/user/last-threads", Verify, getLastThreads);

export default router;
