import crypto from "crypto";
import sharp from "sharp";

import {
    PutObjectCommand
} from "@aws-sdk/client-s3";

import {
    GetObjectCommand
} from "@aws-sdk/client-s3";

import {
    getSignedUrl
} from "@aws-sdk/s3-request-presigner";

import s3Client from "../config/s3.js";

import {
    createFile,
    findFileByIdForUser
} from "../repositories/file-repository.js";

import {
    AppError
} from "../errors/app-error.js";

function generateObjectKey(userId, extension) {

    const randomId =
        crypto.randomUUID();

    return `users/${userId}/files/${randomId}.${extension}`;
}

async function detectImageType(buffer) {

    try {

        const metadata =
            await sharp(buffer).metadata();

        const allowedFormats = [
            "jpeg",
            "png",
            "webp"
        ];

        if (
            !metadata.format ||
            !allowedFormats.includes(metadata.format)
        ) {
            throw new AppError(
                "Invalid image format",
                400,
                "INVALID_IMAGE_FORMAT"
            );
        }

        return metadata.format;

    } catch (error) {

        if (error instanceof AppError) {
            throw error;
        }

        throw new AppError(
            "Uploaded file is not a valid image",
            400,
            "INVALID_IMAGE"
        );
    }
}

export async function uploadFile({
    userId,
    file
}) {

    if (!file) {
        throw new AppError(
            "Image file is required",
            400,
            "FILE_REQUIRED"
        );
    }

    const imageFormat =
        await detectImageType(file.buffer);

    const extension =
        imageFormat === "jpeg"
            ? "jpg"
            : imageFormat;

    const objectKey =
        generateObjectKey(
            userId,
            extension
        );

    const contentType =
        `image/${imageFormat}`;

    try {

        const uploadCommand =
            new PutObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET,
                Key: objectKey,
                Body: file.buffer,
                ContentType: contentType
            });

        await s3Client.send(
            uploadCommand
        );

        try {

            const savedFile =
                await createFile({
                    userId,
                    objectKey,
                    originalFilename:
                        file.originalname,
                    contentType,
                    sizeBytes:
                        file.size
                });

            return savedFile;

        } catch (databaseError) {

            // Database failed after S3 upload.
            // Attempt to clean up the orphaned S3 object.

            const {
                DeleteObjectCommand
            } = await import(
                "@aws-sdk/client-s3"
            );

            await s3Client.send(
                new DeleteObjectCommand({
                    Bucket:
                        process.env.AWS_S3_BUCKET,
                    Key: objectKey
                })
            );

            throw databaseError;
        }

    } catch (error) {

        if (error instanceof AppError) {
            throw error;
        }

        throw new AppError(
            "File upload failed",
            500,
            "FILE_UPLOAD_FAILED"
        );
    }
}