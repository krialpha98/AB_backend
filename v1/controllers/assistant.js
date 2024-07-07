import OpenAI from "openai";
import Thread from "../models/Thread.js"; // Ensure this import is correct

const openai = new OpenAI();

// Updated createThread
export const createThread = async (req, res) => {
  try {
    console.log("Received request to create thread.");
    const userEmail = req.user.email;
    console.log(`User email: ${userEmail}`);

    const thread = await openai.beta.threads.create();
    console.log("OpenAI thread creation response:", thread);

    const newThread = new Thread({
      threadId: thread.id,
      userEmail: userEmail,
      lastInteraction: Date.now(),
    });

    await newThread.save();
    console.log("New thread saved to database with ID:", newThread.threadId);

    res.status(200).json({ threadId: thread.id });
  } catch (error) {
    console.error("Error creating thread:", error);
    res.status(500).json({ error: error.message });
  }
};

// Updated addMessage
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

    // Update the last interaction time
    await Thread.findOneAndUpdate({ threadId }, { lastInteraction: Date.now() });

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

export const getRunStatus = async (req, res) => {
  try {
    const { threadId, runId } = req.params; // Ensure both threadId and runId are captured
    console.log(`Received request to get run status for threadId: ${threadId}, runId: ${runId}`);

    const runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
    console.log("OpenAI run status retrieval response:", runStatus);

    res.status(200).json(runStatus);
  } catch (error) {
    console.error(`Error retrieving run status for threadId: ${threadId}, runId: ${runId}`, error);
    res.status(500).json({ error: error.message });
  }
};

export const getRunSteps = async (req, res) => {
  try {
    const { threadId, runId } = req.params;
    console.log(`Received request to get run steps for threadId: ${threadId}, runId: ${runId}`);

    const runSteps = await openai.beta.threads.runs.steps.list(threadId, runId);
    console.log("OpenAI run steps retrieval response:", runSteps);

    res.status(200).json(runSteps);
  } catch (error) {
    console.error(`Error fetching run steps for threadId: ${threadId}, runId: ${runId}`, error);
    res.status(500).json({ error: error.message });
  }
};

export const cancelRun = async (req, res) => {
  try {
    const { threadId, runId } = req.params;
    console.log(`Received request to cancel run for threadId: ${threadId}, runId: ${runId}`);

    const cancelledRun = await openai.beta.threads.runs.cancel(threadId, runId);
    console.log("OpenAI run cancellation response:", cancelledRun);

    res.status(200).json(cancelledRun);
  } catch (error) {
    console.error(`Error cancelling run for threadId: ${threadId}, runId: ${runId}`, error);
    res.status(500).json({ error: error.message });
  }
};

export const listMessages = async (req, res) => {
  try {
    const { threadId } = req.params;
    const { runId } = req.query; // Extract runId from query parameters

    console.log(`Received request to list messages for threadId: ${threadId}, runId: ${runId}`);

    const messages = await openai.beta.threads.messages.list(threadId, {
      run_id: runId // Include runId in the API call if provided
    });

    console.log(`Retrieved ${messages.data.length} messages for threadId: ${threadId}, runId: ${runId}`);
    console.log("Messages data:", JSON.stringify(messages.data, null, 2)); // Log the messages data

    res.status(200).json(messages.data);
  } catch (error) {
    console.error("Error listing messages:", error);
    res.status(500).json({ error: error.message });
  }
};
