import { validationResult } from "express-validator";

const Validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let error = {};
        errors.array().map((err) => (error[err.param] = err.msg));
        console.log("Validation error:", error);
        return res.status(422).json({ error });
    }
    next();
};

export default Validate;
