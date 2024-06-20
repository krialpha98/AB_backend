import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
    {
        thread_id: {
            type: String,
            required: true,
            unique: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        last_interacted: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

export default mongoose.model("conversations", ConversationSchema);
