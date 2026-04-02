import { v2 as cloudinary } from 'cloudinary';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'];

// Validate file type and size
function validateFile(file) {
    if (!file) {
        return { valid: false, message: 'No file provided' };
    }

    if (file.size > MAX_FILE_SIZE) {
        return { valid: false, message: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit` };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
        return { valid: false, message: 'Invalid file type. Only JPG, PNG, PDF allowed' };
    }

    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return { valid: false, message: 'Invalid file extension' };
    }

    return { valid: true };
}

// Upload single file to Cloudinary
export async function uploadFile(file, folder = 'general') {
    try {
        // Validate file
        const validation = validateFile(file);
        if (!validation.valid) {
            throw new Error(validation.message);
        }

        // Read file data
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary via stream
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: `smc-protocol/${folder}`,
                    resource_type: 'auto', // Auto-detect image or raw (pdf)
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        reject({
                            success: false,
                            error: error.message
                        });
                    } else {
                        resolve({
                            success: true,
                            url: result.secure_url,
                            publicId: result.public_id,
                            filename: result.original_filename,
                            originalName: file.name,
                            size: result.bytes,
                            type: result.resource_type
                        });
                    }
                }
            );

            uploadStream.end(buffer);
        });

    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// Upload multiple files
export async function uploadMultipleFiles(files, folder = 'general') {
    const results = [];
    const errors = [];

    for (const file of files) {
        const result = await uploadFile(file, folder);
        if (result.success) {
            results.push(result);
        } else {
            errors.push({ file: file.name, error: result.error });
        }
    }

    return {
        success: errors.length === 0,
        uploaded: results,
        errors
    };
}

// Delete file from Cloudinary
export async function deleteFile(publicIdOrUrl) {
    try {
        if (!publicIdOrUrl) return { success: false, error: 'No public ID or URL provided' };

        // Extract public ID if full URL is provided
        // This is a basic extraction and might need adjustment based on specific URL structure
        let publicId = publicIdOrUrl;
        if (publicIdOrUrl.includes('cloudinary.com')) {
            // Example: https://res.cloudinary.com/demo/image/upload/v1614015657/investpro/folder/myimage.jpg
            // public_id: investpro/folder/myimage
            const parts = publicIdOrUrl.split('/');
            const uploadIndex = parts.indexOf('upload');
            if (uploadIndex !== -1) {
                // Skip 'v1234567890' version part if present
                const versionRegex = /^v\d+$/;
                let startIndex = uploadIndex + 1;
                if (versionRegex.test(parts[startIndex])) {
                    startIndex++;
                }
                // Join the rest, remove extension
                const pathWithExt = parts.slice(startIndex).join('/');
                publicId = pathWithExt.replace(/\.[^/.]+$/, "");
            }
        }

        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result === 'ok') {
            return { success: true };
        } else {
            return { success: false, error: result.result };
        }

    } catch (error) {
        console.error('File deletion error:', error);
        return { success: false, error: error.message };
    }
}

// Get file info (Utility helper)
export function getFileInfo(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    const isPDF = ext === '.pdf';

    return {
        extension: ext,
        isImage,
        isPDF,
        isDocument: isPDF,
        mimeType: isImage ? `image/${ext.slice(1)}` : (isPDF ? 'application/pdf' : 'application/octet-stream')
    };
}

// Upload KYC documents (Generic: Front and Back)
export async function uploadGenericKYCDocuments(frontFile, backFile) {
    const results = {
        front: null,
        back: null,
        errors: []
    };

    // Upload Front
    if (frontFile) {
        const frontResult = await uploadFile(frontFile, 'kyc/front');
        if (frontResult.success) {
            results.front = frontResult;
        } else {
            results.errors.push({ document: 'front', error: frontResult.error });
        }
    } else {
        results.errors.push({ document: 'front', error: 'Front document photo is required' });
    }

    // Upload Back
    if (backFile) {
        const backResult = await uploadFile(backFile, 'kyc/back');
        if (backResult.success) {
            results.back = backResult;
        } else {
            results.errors.push({ document: 'back', error: backResult.error });
        }
    } else {
        results.errors.push({ document: 'back', error: 'Back document photo is required' });
    }

    results.success = results.errors.length === 0;
    return results;
}

// Upload KYC documents (Aadhar and PAN) - DEPRECATED in favor of generic
export async function uploadKYCDocuments(aadharFile, panFile) {
    const results = {
        aadhar: null,
        pan: null,
        errors: []
    };

    // Upload Aadhar
    if (aadharFile) {
        const aadharResult = await uploadFile(aadharFile, 'kyc/aadhar');
        if (aadharResult.success) {
            results.aadhar = aadharResult;
        } else {
            results.errors.push({ document: 'aadhar', error: aadharResult.error });
        }
    } else {
        results.errors.push({ document: 'aadhar', error: 'Aadhar document is required' });
    }

    // Upload PAN
    if (panFile) {
        const panResult = await uploadFile(panFile, 'kyc/pan');
        if (panResult.success) {
            results.pan = panResult;
        } else {
            results.errors.push({ document: 'pan', error: panResult.error });
        }
    } else {
        results.errors.push({ document: 'pan', error: 'PAN document is required' });
    }

    results.success = results.errors.length === 0;
    return results;
}

// Upload payment proof
export async function uploadPaymentProof(file) {
    return await uploadFile(file, 'payments');
}

