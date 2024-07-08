import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { PORT, URI } from "./config/index.js";
import App from "./routes/index.js";
import assistantRoutes from "./routes/assistant.js";
import authRoutes from "./routes/auth.js";

const server = express();

// Configure CORS
const corsOptions = {
    origin: ['http://localhost:3000', 'https://ab-frontend-heroku-b3741ff3df26.herokuapp.com'], // Update with your frontend URL: https://ab-frontend-heroku-b3741ff3df26.herokuapp.com
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

server.use("/v1/auth", authRoutes); // Use auth routes
server.use("/v1/assistant", assistantRoutes);

server.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
);
