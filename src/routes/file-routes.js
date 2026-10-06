import express from "express";

import {
    authenticate
} from "../middleware/auth-middleware.js";

import upload
    from "../middleware/upload-middleware.js";

import {
    uploadFileHandler,
    getFileHandler
} from "../controllers/file-controller.js";

const router = express.Router();

router.post(
    "/",
    authenticate,
    upload.single("file"),
    uploadFileHandler
);

router.get(
    "/:id",
    authenticate,
    getFileHandler
);

export default router;