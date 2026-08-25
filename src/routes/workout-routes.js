import express from "express";
const router = express.Router();

router.post("/" ,(req, res) => {
    res.status(201).json({
        message: "Workout created"
    });
});

router.get("/" ,(req, res) => {
    res.status(200).json([]);
});

export default router;
