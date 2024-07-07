import mongoose from "mongoose";

const ThreadSchema = new mongoose.Schema(
  {
    threadId: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    lastInteraction: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("threads", ThreadSchema);
