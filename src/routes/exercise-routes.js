import pool from "../db/pool.js";
import express from "express";
const router = express.Router();

router.get("/" , async(req, res, next) => {
    try{
        const result = await pool.query(`
            SELECT
                id,
                name,
                description,
                category,
                muscle_group,
                created_at
            FROM exercises
            ORDER BY id;
        `);

        res.status(200).json(result.rows);
    }catch(error){
        next(error);
    }
});

router.get("/:id" , async(req, res, next) => {
    try{
        const { id } = req.params;

        if (!/^\d+$/.test(id)) {
            return res.status(400).json({
                error: {
                    code: "INVALID_EXERCISE_ID",
                    message: "Exercise ID must be a positive integer"
                }
            });
        }

        const exerciseId = Number(id);

        if (!Number.isSafeInteger(exerciseId) ||exerciseId <= 0){
            return res.status(400).json({
                error: {
                    code: "INVALID_EXERCISE_ID",
                    message: "Exercise ID must be a positive integer"
                }
            });
        }

        const result = await pool.query(`
            SELECT
                id,
                name,
                description,
                category,
                muscle_group,
                created_at
            FROM exercises
            WHERE id = $1;
            `,
            [exerciseId]
        );

    
    if (result.rows.length === 0) {
            return res.status(404).json({
                error: {
                    code: "EXERCISE_NOT_FOUND",
                    message: "Exercise not found"
                }
            });
        }

        res.status(200).json(result.rows[0]);
    }

     catch (error) {
        next(error);
    }

});

export default router;