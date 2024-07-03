import mongoose from "mongoose";

const ThreadSchema = new mongoose.Schema(
  {
    threadId: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("threads", ThreadSchema);
