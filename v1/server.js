import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { PORT, URI } from "./config/index.js";
import App from "./routes/index.js";
import ConversationRoutes from "./routes/conversation.js"; // Import the conversation routes

const server = express();

// Configure CORS
const corsOptions = {
    origin: 'https://ab-frontend-heroku-b3741ff3df26.herokuapp.com', // Replace with your actual frontend URL
    credentials: true,
};

server.use(cors(corsOptions));
server.use(cookieParser());
server.use(express.urlencoded({ extended: false }));
server.use(express.json());
server.disable("x-powered-by");

mongoose.promise = global.Promise;
mongoose.set("strictQuery", false);
mongoose
    .connect(URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to database"))
    .catch((err) => console.log(err));

server.use(App);
server.use("/v1/conversation", ConversationRoutes); // Use the conversation routes

server.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
);
