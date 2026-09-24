import express from "express";
import cors from "cors";
import healthRouter from "./routes/health-routes.js";
import exerciseRouter from "./routes/exercise-routes.js";
import workoutRouter from "./routes/workout-routes.js"
import logger from "./middleware/logger.js";
import authRouter from "./routes/auth-routes.js";
import errorHandler from "./middleware/errorHandler.js";
const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(logger);

app.use(express.json());

app.use((req, res, next) => {

    req.requestStartedAt = Date.now();

    next();
});

app.get("/" , (req, res) => {
    res.status(200).json({
        message: "WELCOME TO WORKOUT TRACKER"
    });

})

app.use("/api/v1/health", healthRouter);

app.use("/api/v1/exercises" , exerciseRouter);

app.use("/api/v1/workouts" , workoutRouter);

app.use("/api/v1/auth", authRouter);

app.use((req, res) => {

    res.status(404).json({
        error: {
            code: "ROUTE_NOT_FOUND",
            message: "Route not found"
        }
    });

});

app.use(errorHandler);

export default app;