import { AppError } from "../errors/app-error.js";
// This is a higher-order function.
// A higher-order function is simply a function that:
// receives a function/value and/or
// returns a function.

export function validate(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        //checks the input without throwing an exception. - safeParse - return success T/F
        if (!result.success) {
            const message =
                result.error.issues
                    .map(issue => issue.message)
                    .join(", ");

            return next(
                new AppError(
                    message,
                    400,
                    "VALIDATION_ERROR"
                )
            );
        }

        req.body = result.data;

        next();
    };
}