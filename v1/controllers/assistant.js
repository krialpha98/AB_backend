import OpenAI from "openai";
import Thread from "../models/Thread.js"; // Ensure this import is correct

const openai = new OpenAI();

export const createThread = async (req, res) => {
  try {
    console.log("Received request to create thread.");
    const userEmail = req.user.email;

    const thread = await openai.beta.threads.create();
    console.log("OpenAI thread creation response:", thread);

    const newThread = new Thread({
      threadId: thread.id,
      userEmail: userEmail,
    });

    await newThread.save();
    console.log("New thread saved to database with ID:", newThread.threadId);

    res.status(200).json({ threadId: thread.id });
  } catch (error) {
    console.error("Error creating thread:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getRunStatus = async (req, res) => {
  try {
    const { threadId, runId } = req.params;
    const runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
    res.status(200).json(runStatus);
  } catch (error) {
    console.error("Error retrieving run status:", error);
    res.status(500).json({ error: error.message });
  }
};

export const addMessage = async (req, res) => {
  try {
    console.log("Received request to add message.");
    const { threadId, content } = req.body;
    const userId = req.user.id;

    // Ensure threadId is defined
    if (!threadId) {
      throw new Error("threadId is not defined");
    }

    // Add the user message to the thread
    const userMessage = await openai.beta.threads.messages.create(threadId, {
      role: 'user',  // Ensure the 'role' parameter is included
      content: [{ type: 'text', text: content }],
    });
    console.log("User message added to thread:", userMessage);

    // Initiate the assistant run
    const runResponse = await openai.beta.threads.runs.create(threadId, {
      assistant_id: 'asst_qXe9zOvg7nDifslUtHCJY9Oh',
    });
    console.log("Assistant run response:", runResponse);

    res.status(200).json({ runId: runResponse.id });
  } catch (error) {
    console.error("Error adding message:", error);
    res.status(500).json({ error: error.message });
  }
};

export const listMessages = async (req, res) => {
  try {
    const { threadId } = req.params;
    const messages = await openai.beta.threads.messages.list(threadId);
    res.status(200).json(messages.data);
  } catch (error) {
    console.error("Error listing messages:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getMessage = async (req, res) => {
  try {
    const { threadId, messageId } = req.params;
    const message = await openai.beta.threads.messages.retrieve(threadId, messageId);
    res.status(200).json(message);
  } catch (error) {
    console.error("Error retrieving message:", error);
    res.status(500).json({ error: error.message });
  }
};

export const createRun = async (req, res) => {
  try {
    const { threadId } = req.params;
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: "asst_qXe9zOvg7nDifslUtHCJY9Oh",
    });
    res.status(200).json(run);
  } catch (error) {
    console.error("Error creating run:", error);
    res.status(500).json({ error: error.message });
  }
};

export const listRuns = async (req, res) => {
  try {
    const { threadId } = req.params;
    const runs = await openai.beta.threads.runs.list(threadId);
    res.status(200).json(runs.data);
  } catch (error) {
    console.error("Error listing runs:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getRun = async (req, res) => {
  try {
    const { threadId, runId } = req.params;
    const run = await openai.beta.threads.runs.retrieve(threadId, runId);
    res.status(200).json(run);
  } catch (error) {
    console.error("Error retrieving run:", error);
    res.status(500).json({ error: error.message });
  }
};

export const listRunSteps = async (req, res) => {
  try {
    const { threadId, runId } = req.params;
    const steps = await openai.beta.threads.runs.steps.list(threadId, runId);
    res.status(200).json(steps.data);
  } catch (error) {
    console.error("Error listing run steps:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getRunStep = async (req, res) => {
  try {
    const { threadId, runId, stepId } = req.params;
    const step = await openai.beta.threads.runs.steps.retrieve(threadId, runId, stepId);
    res.status(200).json(step);
  } catch (error) {
    console.error("Error retrieving run step:", error);
    res.status(500).json({ error: error.message });
  }
};
