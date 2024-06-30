// v1/routes/auth.js
import express from "express";
import { Register, Login, Logout } from "../controllers/auth.js";
import Validate from "../middleware/validate.js";
import { check } from "express-validator";
import { Verify } from '../middleware/verify.js'; // Ensure the correct middleware is imported

const router = express.Router();

router.post(
    "/register",
    check("email")
        .isEmail()
        .withMessage("Enter a valid email address"),
    check("first_name")
        .not()
        .isEmpty()
        .withMessage("Your first name is required")
        .trim()
        .escape(),
    check("last_name")
        .not()
        .isEmpty()
        .withMessage("Your last name is required")
        .trim()
        .escape(),
    check("password")
        .notEmpty()
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 chars long"),
    Validate,
    Register
);

router.post(
    "/login",
    check("email")
        .isEmail()
        .withMessage("Enter a valid email address"),
    check("password").not().isEmpty(),
    Validate,
    Login
);

router.get("/logout", Logout);

// Add the /me endpoint to get the current authenticated user
router.get("/me", Verify, (req, res) => {
    res.json({ user: req.user });
});

export default router;
