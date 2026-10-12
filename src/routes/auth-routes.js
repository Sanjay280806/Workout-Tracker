import express from "express";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { authenticate } from "../middleware/auth-middleware.js";
import { createRateLimiter } from "../middleware/rate-limit.js";
import redisClient from "../config/redis.js";

import {
  findUserByEmail,
  createUser,
} from "../repositories/user-repository.js";

const router = express.Router();

// Rate limiter for registration
const registerRateLimiter = createRateLimiter({
  keyPrefix: "rate-limit:register",
  limit: 5,
  windowSeconds: 60,
  keyGenerator: (req) => req.ip,
});

// Rate limiter for login
const loginRateLimiter = createRateLimiter({
  keyPrefix: "rate-limit:login",
  limit: 5,
  windowSeconds: 60,
  keyGenerator: (req) => req.ip,
});

router.post("/register", registerRateLimiter, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: {
          code: "INVALID_REGISTRATION_DATA",
          message: "name, email and password are required",
        },
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser) {
      return res.status(409).json({
        error: {
          code: "EMAIL_ALREADY_EXISTS",
          message: "Unable to create account with these details",
        },
      });
    }

    const passwordHash = await argon2.hash(password);

    const user = await createUser({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    return res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

router.post("/login", loginRateLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: "INVALID_LOGIN_DATA",
          message: "email and password are required",
        },
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await findUserByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json({
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
        },
      });
    }

    const passwordValid = await argon2.verify(
      user.password_hash,
      password
    );

    if (!passwordValid) {
      return res.status(401).json({
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
        },
      });
    }

    const token = jwt.sign(
      {
        sub: String(user.id),
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      }
    );

    return res.status(200).json({
      message: "Login successful",
      accessToken: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/me", authenticate, async (req, res) => {
  return res.status(200).json({
    userId: req.user.id,
  });
});

export default router;
