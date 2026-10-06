import multer from "multer";

export class AppError extends Error {
    constructor(
        message,
        statusCode,
        code
    ) {
        super(message);

        this.statusCode = statusCode;
        this.code = code;
    }
}

export function errorHandler(
    error,
    req,
    res,
    next
) {

    console.error(error);

    if (
        error instanceof multer.MulterError
    ) {

        if (
            error.code === "LIMIT_FILE_SIZE"
        ) {

            return res.status(413).json({
                error: {
                    code:
                        "FILE_TOO_LARGE",

                    message:
                        "File size must not exceed 5 MB"
                }
            });
        }

        return res.status(400).json({
            error: {
                code:
                    "FILE_UPLOAD_ERROR",

                message:
                    error.message
            }
        });
    }

    const statusCode =
        error.statusCode || 500;

    res.status(statusCode).json({
        error: {
            code:
                error.code ||
                "INTERNAL_SERVER_ERROR",

            message:
                statusCode === 500
                    ? "Internal server error"
                    : error.message
        }
    });
}