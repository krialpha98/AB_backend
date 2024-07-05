import express from "express";
import {
  createThread,
  addMessage,
  listMessages,
  getMessage,
  createRun,
  listRuns,
  getRun,
  listRunSteps,
  getRunStep,
} from "../controllers/assistant.js";
import {Verify} from "../middleware/verify.js";

const router = express.Router();

// Remove or comment out the `Verify` middleware
router.post("/create-thread", Verify, createThread);
router.post("/add-message", addMessage);
router.get("/threads/:threadId/messages", listMessages);
router.get("/threads/:threadId/messages/:messageId", getMessage);
router.post("/threads/:threadId/runs", createRun);
router.get("/threads/:threadId/runs", listRuns);
router.get("/threads/:threadId/runs/:runId", getRun);
router.get("/threads/:threadId/runs/:runId/steps", listRunSteps);
router.get("/threads/:threadId/runs/:runId/steps/:stepId", getRunStep);

export default router;
