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

router.post('/create-thread', createThread);
router.post('/add-message', addMessageToThread);
router.post('/run-assistant', runAssistant);
router.get('/thread-messages/:threadId', getThreadMessages);
router.post('/cancel-run', cancelRun);

export default router;
