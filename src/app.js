import express from "express";
const app = express();

const exercises = [
    {
        id: 1,
        name: "Bench Press",
        category: "strength",
        muscleGroup: "chest"
    },
    {
        id: 2,
        name: "Squat",
        category: "strength",
        muscleGroup: "legs"
    }
];

app.use((req, res, next) => {

    console.log(
        `${req.method} ${req.url}`
    );

    next();
});

app.use((req, res, next) => {

    req.requestStartedAt = Date.now();

    next();
});

app.get("/" , (req, res) => {
    res.status(200).json({
        message: "WELCOME TO WORKOUT TRACKER"
    });

})

app.get("/api/v1/health", (req, res) => {

    res.status(200).json({
        status: "OK"
    });

});

app.get("/api/v1/exercises", (req, res) => {

    console.log(
        "Request started at:",
        req.requestStartedAt
    );

    res.status(200).json(exercises);

});

app.get("/api/v1/exercises/:id", (req, res) => {

    const id = Number(req.params.id);

    const exercise = exercises.find(
        (exercise) => exercise.id === id
    );

    if (!exercise) {

        return res.status(404).json({
            error: "Exercise not found"
        });

    }

    res.status(200).json(exercise);

});

app.post("/api/v1/workouts", (req, res) => {

    res.status(201).json({
        message: "Workout created"
    });

});

app.use((req, res) => {

    res.status(404).json({
        error: "Route not found"
    });

});

export default app;