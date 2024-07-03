import OpenAI from "openai";

const openai = new OpenAI();

export const createThread = async (req, res) => {
    try {
      const thread = await openai.beta.threads.create();
      const userId = req.user._id; // Assuming the user ID is attached to req.user by the Verify middleware
      const userEmail = req.user.email; // Assuming the user email is attached to req.user by the Verify middleware
  
      const newThread = new Thread({
        threadId: thread.id,
        userId: userId,
        userEmail: userEmail,
      });
  
      await newThread.save();
  
      res.status(200).json({ threadId: thread.id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  

export const addMessageToThread = async (req, res) => {
  const { threadId, content } = req.body;
  try {
    const message = await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: content,
    });
    res.status(200).json({ messageId: message.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const runAssistant = async (req, res) => {
  const { threadId } = req.body;
  const assistantId = "asst_qXe9zOvg7nDifslUtHCJY9Oh";
  try {
    const run = await openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: assistantId,
    });
    res.status(200).json({ runId: run.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getThreadMessages = async (req, res) => {
  const { threadId } = req.params;
  try {
    const thread = await openai.beta.threads.retrieve(threadId);
    res.status(200).json(thread.messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const cancelRun = async (req, res) => {
  const { runId } = req.body;
  try {
    const cancelledRun = await openai.beta.threads.runs.cancel(runId);
    res.status(200).json({ cancelledRunId: cancelledRun.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
