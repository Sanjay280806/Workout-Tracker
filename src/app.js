import express from "express";
import healthRouter from "./routes/health-routes.js";
import exerciseRouter from "./routes/exercise-routes.js";
import workoutRouter from "./routes/workout-routes.js"
import logger from "./middleware/logger.js";
const app = express();

app.use(express.json());

app.use(logger);

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
app.use((req, res) => {

    res.status(404).json({
        error: "Route not found"
    });

});

export default app;