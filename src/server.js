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
