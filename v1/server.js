import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { PORT, URI } from "./config/index.js";
import App from "./routes/index.js";
import assistantRoutes from "./routes/assistant.js"; // Import the new assistant routes

const server = express();

// Configure CORS
const corsOptions = {
    origin: '*', // Allow all origins for development purposes
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
server.use("/v1/assistant", assistantRoutes); // Use the new assistant routes

server.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
);
