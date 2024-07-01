import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { PORT, URI } from "./config/index.js";
import App from "./routes/index.js";

const server = express();

const corsOptions = {
    origin: 'https://ab-frontend-heroku-b3741ff3df26.herokuapp.com', // Your frontend URL
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    optionsSuccessStatus: 200 // For legacy browser support
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

// Respond to preflight requests
server.options('*', cors(corsOptions));

server.use('/v1', App);

server.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
);
