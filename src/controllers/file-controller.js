import {
    uploadFile,
    getFileDownloadUrl
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

export async function getFileHandler(
    req,
    res,
    next
) {

    try {

        const fileId =
            Number(req.params.id);

        if (
            !Number.isSafeInteger(fileId) ||
            fileId <= 0
        ) {

            return res.status(400).json({
                error: {
                    code:
                        "INVALID_FILE_ID",

                    message:
                        "Invalid file ID"
                }
            });
        }

        const result =
            await getFileDownloadUrl({
                fileId,
                userId: req.user.id
            });

        res.json({
            id: result.file.id,

            originalFilename:
                result.file.original_filename,

            contentType:
                result.file.content_type,

            sizeBytes:
                Number(
                    result.file.size_bytes
                ),

            url:
                result.signedUrl,

            expiresInSeconds:
                300
        });

    } catch (error) {

        next(error);
    }
}