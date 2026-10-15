import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { configureWorkoutSockets } from "./socket/workout-socket.js";

const PORT = process.env.PORT || 3000;

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});

configureWorkoutSockets(io);

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

let shuttingDown = false;

async function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;

    console.log(`${signal} received. Shutting down API...`);

    const forceExit = setTimeout(() => {
        console.error("Forced shutdown after timeout");
        process.exit(1);
    }, 10000);

    forceExit.unref();

    try {
        await new Promise((resolve, reject) => {
            httpServer.close((error) => {
                if (error) reject(error);
                else resolve();
            });
        });

        await io.close();

        console.log("API shutdown complete");
        process.exitCode = 0;
    } catch (error) {
        console.error("API shutdown error:", error);
        process.exitCode = 1;
    } finally {
        clearTimeout(forceExit);
    }
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

