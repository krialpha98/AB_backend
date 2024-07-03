import OpenAI from 'openai';

const openai = new OpenAI();

// In-memory store for threads (consider using a database for production)
const threads = {};

// Create a new thread
export const createThread = async (req, res) => {
    try {
        const thread = await openai.beta.threads.create();
        threads[thread.id] = thread;
        res.json({ threadId: thread.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add a message to a thread
export const addMessage = async (req, res) => {
    const { threadId } = req.params;
    const { role, content } = req.body;

    if (!threads[threadId]) {
        return res.status(404).json({ error: 'Thread not found' });
    }

    try {
        const message = await openai.beta.threads.messages.create(threadId, {
            role,
            content
        });
        res.json(message);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Stream responses
export const streamResponse = (req, res) => {
    const { threadId } = req.params;

    if (!threads[threadId]) {
        return res.status(404).json({ error: 'Thread not found' });
    }

    const ASSISTANT_ID = 'asst_qXe9zOvg7nDifslUtHCJY9Oh';

    const run = openai.beta.threads.runs.stream(threadId, {
        assistant_id: ASSISTANT_ID
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    run
        .on('textCreated', (text) => res.write(`data: ${text.value}\n\n`))
        .on('textDelta', (textDelta) => res.write(`data: ${textDelta.value}\n\n`))
        .on('toolCallCreated', (toolCall) => res.write(`data: ${toolCall.type}\n\n`))
        .on('toolCallDelta', (toolCallDelta) => {
            if (toolCallDelta.type === 'code_interpreter') {
                if (toolCallDelta.code_interpreter.input) {
                    res.write(`data: ${toolCallDelta.code_interpreter.input}\n\n`);
                }
                if (toolCallDelta.code_interpreter.outputs) {
                    res.write("data: output >\n\n");
                    toolCallDelta.code_interpreter.outputs.forEach(output => {
                        if (output.type === "logs") {
                            res.write(`data: ${output.logs}\n\n`);
                        }
                    });
                }
            }
        })
        .on('end', () => res.end());

    req.on('close', () => run.cancel());
};
