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
  getRunStatus,
} from "../controllers/assistant.js";
import { Verify } from "../middleware/verify.js";

const router = express.Router();

router.post("/create-thread", Verify, createThread);
router.post("/add-message", Verify, addMessage);
router.get("/threads/:threadId/messages", Verify, listMessages);
router.get("/threads/:threadId/messages/:messageId", Verify, getMessage);
router.post("/threads/:threadId/runs", Verify, createRun);
router.get("/threads/:threadId/runs", Verify, listRuns);
router.get("/threads/:threadId/runs/:runId", Verify, getRun);
router.get("/threads/:threadId/runs/:runId/steps", Verify, listRunSteps);
router.get("/threads/:threadId/runs/:runId/steps/:stepId", Verify, getRunStep);
router.get("/runs/:runId/status", Verify, getRunStatus);

export default router;
