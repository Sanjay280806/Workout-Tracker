import express from "express";
import argon2 from "argon2";

import {
    findUserByEmail,
    createUser
} from "../repositories/user-repository.js";

const router = express.Router();

router.post("/register", async (req, res, next) => {
    try {
        const {
            name,
            email,
            password
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                error: {
                    code: "INVALID_REGISTRATION_DATA",
                    message: "name, email and password are required"
                }
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser =
            await findUserByEmail(normalizedEmail);

        if (existingUser) {
            return res.status(409).json({
                error: {
                    code: "EMAIL_ALREADY_EXISTS",
                    message: "Unable to create account with these details"
                }
            });
        }

        const passwordHash =
            await argon2.hash(password);

        const user = await createUser({
            name: name.trim(),
            email: normalizedEmail,
            passwordHash
        });

        res.status(201).json(user);

    } catch (error) {
        next(error);
    }
});

router.post("/login", async (req, res, next) => {
    try {
        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: {
                    code: "INVALID_LOGIN_DATA",
                    message: "email and password are required"
                }
            });
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        const user =
            await findUserByEmail(normalizedEmail);

        if (!user) {
            return res.status(401).json({
                error: {
                    code: "INVALID_CREDENTIALS",
                    message: "Invalid email or password"
                }
            });
        }

        const passwordValid =
            await argon2.verify(
                user.password_hash,
                password
            );

        if (!passwordValid) {
            return res.status(401).json({
                error: {
                    code: "INVALID_CREDENTIALS",
                    message: "Invalid email or password"
                }
            });
        }

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        next(error);
    }
});

export default router;