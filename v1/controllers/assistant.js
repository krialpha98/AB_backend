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

export const addMessage = async (req, res) => {
  try {
    console.log("Received request to add message.");
    const { threadId, content } = req.body;
    const userId = req.user.id;

    // Ensure threadId is defined
    if (!threadId) {
      throw new Error("threadId is not defined");
    }

    // Check if there are existing messages in the thread
    const existingMessages = await openai.beta.threads.messages.list(threadId, {
      limit: 1 // We only need to know if there's at least one message
    });

    const isFirstMessage = existingMessages.data.length === 0;
    console.log(`Is this the first message in the thread? ${isFirstMessage}`);

    // Add the user message to the thread
    const userMessage = await openai.beta.threads.messages.create(threadId, {
      role: 'user',  // Ensure the 'role' parameter is included
      content: [{ type: 'text', text: content }],
    });
    // console.log("User message added to thread:", userMessage);

    // Update the last interaction time
    await Thread.findOneAndUpdate({ threadId }, { lastInteraction: Date.now() });

    let chatName = null;

    if (isFirstMessage) {
      // Generate a short description using GPT-3.5
      const chatCompletion = await openai.chat.completions.create({
        messages: [{ role: "system", content: "Genera una breve descrizione di questa chat in non più di 6 parole." }, { role: "user", content: content }],
        model: "gpt-4o-mini",
        max_tokens: 15,
        temperature: 0.5,
        n: 1,
        stop: null
      });

      chatName = chatCompletion.choices[0].message.content.trim();
      console.log(`Generated chat name: ${chatName}`);

      // Update the thread entry in the database with the generated chat name
      await Thread.findOneAndUpdate({ threadId }, { chatName });
    }

    // Initiate the assistant run
    const runResponse = await openai.beta.threads.runs.create(threadId, {
      assistant_id: 'asst_qXe9zOvg7nDifslUtHCJY9Oh',
    });
    // console.log("Assistant run response:", runResponse);

    // print to log the id of the run
    console.log(`Run ID: ${runResponse.id}`);

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

    if (!threadId || !runId) {
      throw new Error("threadId or runId is not defined");
    }

    const runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
    // console.log("OpenAI run status retrieval response:", runStatus);

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

// New getLastThreads function
export const getLastThreads = async (req, res) => {
  try {
    const userEmail = req.user.email;
    console.log(`Received request to get last 20 threads with chat names for user email: ${userEmail}`);

    // Fetch the last 20 threads for the user that have a chatName, ordered by lastInteraction
    const threads = await Thread.find({ userEmail, chatName: { $exists: true, $ne: null } })
      .sort({ lastInteraction: -1 })
      .limit(20)
      .select('threadId lastInteraction chatName');

    console.log(`Retrieved ${threads.length} threads with chat names for user email: ${userEmail}`);

    res.status(200).json(threads);
  } catch (error) {
    console.error("Error fetching last threads with chat names:", error);
    res.status(500).json({ error: error.message });
  }
};

// Add this function to the existing import statements
export const getAllMessagesFromThread = async (req, res) => {
  try {
    const { threadId } = req.params;

    console.log(`Received request to fetch all messages for threadId: ${threadId}`);

    // Fetch all messages from the thread
    const messages = await openai.beta.threads.messages.list(threadId);

    // Print the raw result to the console
    console.log("Fetched messages:", JSON.stringify(messages, null, 2));

    // Return the raw result
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages from thread:", error);
    res.status(500).json({ error: error.message });
  }
};
