import jwt from "jsonwebtoken";

export function authenticate(req, res, next) {
    try {
        const authHeader = req.get("Authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                error: {
                    code: "AUTHENTICATION_REQUIRED",
                    message: "Authentication required"
                }
            });
        }

        const token = authHeader.slice(7).trim();

        if (!token) {
            return res.status(401).json({
                error: {
                    code: "INVALID_TOKEN",
                    message: "Invalid authentication token"
                }
            });
        }

        const payload = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (
            typeof payload.sub !== "string" ||
            !/^\d+$/.test(payload.sub)
        ) {
            return res.status(401).json({
                error: {
                    code: "INVALID_TOKEN",
                    message: "Invalid authentication token"
                }
            });
        }

        req.user = {
            id: payload.sub
        };

        next();

    } catch (error) {

        if (
            error.name === "TokenExpiredError" ||
            error.name === "JsonWebTokenError" ||
            error.name === "NotBeforeError"
        ) {
            return res.status(401).json({
                error: {
                    code: "INVALID_TOKEN",
                    message: "Invalid or expired authentication token"
                }
            });
        }

        next(error);
    }
}