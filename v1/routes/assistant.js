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

const router = express.Router();

router.post("/create-thread", Verify, createThread);
router.post("/add-message", Verify, addMessage);
router.get('/thread/:threadId/run/:runId/status', getRunStatus);
router.get('/thread/:threadId/run/:runId/steps', getRunSteps); // New route for run steps
router.post('/thread/:threadId/run/:runId/cancel', cancelRun); // Route for canceling a run
router.get("/threads/:threadId/messages", Verify, listMessages);
router.post("/threads/:threadId/runs", Verify, createRun);

export default router;
