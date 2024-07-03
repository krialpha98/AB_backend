import express from "express";
import Auth from "./auth.js";
import Assistant from "./assistant.js";
import { Verify, VerifyRole } from "../middleware/verify.js";

const app = express();

app.disable("x-powered-by");

app.get("/v1", (req, res) => {
    try {
        res.status(200).json({
            status: "success",
            message: "Welcome to our API homepage!",
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
        });
    }
});

app.use("/v1/auth", Auth);

// Ensure these routes are protected by the Verify middleware
app.use("/v1/assistant", Verify, Assistant);

app.get("/v1/user", Verify, (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Welcome to your Dashboard!",
    });
});

app.get("/v1/admin", Verify, VerifyRole, (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Welcome to the Admin portal!",
    });
});

export default app;
