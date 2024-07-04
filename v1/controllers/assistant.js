import OpenAI from "openai";
import Thread from "../models/Thread.js";  // Ensure this path is correct

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

    // Retrieve the current list of messages in the thread
    const currentMessages = await openai.beta.threads.messages.list(threadId);
    const lastMessageId = currentMessages.messages[currentMessages.messages.length - 1].id;
    console.log("Last message ID before adding new user message:", lastMessageId);

    // Add the user message to the thread
    const message = await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: content,
    });
    console.log("User message added to thread:", message);

    // Run the assistant on the thread to get a response
    const run = await openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: "asst_qXe9zOvg7nDifslUtHCJY9Oh",
    });
    console.log("Assistant run response:", run);

    // Retrieve the list of messages again after the run
    const messagesAfterRun = await openai.beta.threads.messages.list(threadId, { after: lastMessageId });
    console.log("Messages after run:", messagesAfterRun);

    // Extract the assistant's response message
    const assistantMessage = messagesAfterRun.messages.find(msg => msg.role === "assistant");
    if (!assistantMessage) {
      throw new Error("No assistant message found in the run result.");
    }
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
    console.log("Received request to run assistant.");
    console.log("Thread ID:", threadId);

    const run = await openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: assistantId,
    });
    console.log("Assistant run response:", run);

    res.status(200).json({ runId: run.id });
  } catch (error) {
    console.error("Error running assistant:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getThreadMessages = async (req, res) => {
  const { threadId } = req.params;
  try {
    console.log("Received request to get thread messages.");
    console.log("Thread ID:", threadId);

    const thread = await openai.beta.threads.retrieve(threadId);
    console.log("Retrieved thread messages:", thread.messages);

    res.status(200).json(thread.messages);
  } catch (error) {
    console.error("Error getting thread messages:", error);
    res.status(500).json({ error: error.message });
  }
};

export const cancelRun = async (req, res) => {
  const { runId } = req.body;
  try {
    console.log("Received request to cancel run.");
    console.log("Run ID:", runId);

    const cancelledRun = await openai.beta.threads.runs.cancel(runId);
    console.log("Cancelled run:", cancelledRun);

    res.status(200).json({ cancelledRunId: cancelledRun.id });
  } catch (error) {
    console.error("Error cancelling run:", error);
    res.status(500).json({ error: error.message });
  }
};
