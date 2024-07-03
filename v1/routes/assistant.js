import express from 'express';
import {
    createThread,
    addMessageToThread,
    runAssistant,
    getThreadMessages,
    cancelRun
} from '../controllers/assistant.js';
import { Verify } from '../middleware/verify.js';


const router = express.Router();

router.post('/create-thread', Verify, createThread);
router.post('/add-message', Verify, addMessageToThread);
router.post('/run-assistant', Verify, runAssistant);
router.get('/thread-messages/:threadId', Verify, getThreadMessages);
router.post('/cancel-run', Verify, cancelRun);

export default router;
