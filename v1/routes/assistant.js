// v1/routes/assistant.js

import express from "express";
import {
  createThread,
  addMessage,
  listMessages,
  createRun,
  cancelRun,
  getRunSteps,
  getRunStatus,
  getLastThreads,
  getAllMessagesFromThread // Import the new controller function
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
router.get("/user/last-threads", Verify, getLastThreads);

// New route to fetch all messages from a given thread ID
router.get("/thread/:threadId/all-messages", Verify, getAllMessagesFromThread);

export default router;
