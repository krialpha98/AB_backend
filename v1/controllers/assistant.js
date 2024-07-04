import OpenAI from "openai";
import Thread from "../models/Thread.js";  // Make sure this path is correct


const openai = new OpenAI();

export const createThread = async (req, res) => {
  try {
    console.log("Received request to create thread.");
    
    // Assuming the request has been authenticated and req.user is available
    console.log("User info:", req.user);

    const thread = await openai.beta.threads.create();
    console.log("OpenAI thread creation response:", thread);

    const userEmail = req.user.email;

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

export const addMessage = async (req, res) => {
  try {
    console.log("Received request to add message.");

    const { threadId, content } = req.body;
    const userId = req.user._id;

    // Log incoming data
    console.log("Thread ID:", threadId);
    console.log("Message content:", content);
    console.log("User ID:", userId);

    // Add the user message to the thread
    const message = await openai.beta.threads.messages.create(
      threadId,
      {
        role: "user",
        content: content,
      }
    );
    console.log("User message added to thread:", message);

    // Run the assistant on the thread to get a response
    const run = await openai.beta.threads.runs.createAndPoll(
      threadId,
      { 
        assistant_id: "asst_qXe9zOvg7nDifslUtHCJY9Oh" // Use your assistant ID
      }
    );
    console.log("Assistant run response:", run);

    // Extract the assistant's response message
    const assistantMessages = run.result.messages;
    if (!assistantMessages || assistantMessages.length === 0) {
      throw new Error("No assistant message found in the run result.");
    }

    const assistantMessage = assistantMessages[assistantMessages.length - 1];
    console.log("Assistant's response message:", assistantMessage);

    // Return the assistant's response to the client
    res.status(200).json({ content: assistantMessage.content });
  } catch (error) {
    console.error("Error adding message:", error);
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
