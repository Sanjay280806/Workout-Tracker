import {
    uploadFile
} from "../services/file-service.js";

export async function uploadFileHandler(
    req,
    res,
    next
) {

    try {

        const file =
            await uploadFile({
                userId: req.user.id,
                file: req.file
            });

        res.status(201).json({
            id: file.id,
            originalFilename:
                file.original_filename,
            contentType:
                file.content_type,
            sizeBytes:
                Number(file.size_bytes),
            createdAt:
                file.created_at
        });

    } catch (error) {

        next(error);
    }
}