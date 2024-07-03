import express from 'express';
import { createThread, addMessage, streamResponse } from '../controllers/conversation.js';

const router = express.Router();

router.post('/threads', createThread);
router.post('/threads/:threadId/messages', addMessage);
router.get('/threads/:threadId/stream', streamResponse);

export default router;
