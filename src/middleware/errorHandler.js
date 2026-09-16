export default function errorHandler(
    error,
    req,
    res,
    next
) {
    console.error(error);

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