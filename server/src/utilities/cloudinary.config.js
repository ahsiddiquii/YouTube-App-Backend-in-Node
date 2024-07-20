import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const fileUploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        // Upload the file on Cloudinary:
        const fileUploadResponse = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // File has been uploaded successfully:
        // console.log("File has been uploaded successfully", fileUploadResponse.url);
        fs.unlinkSync(localFilePath);
        return fileUploadResponse;
    } catch (error) {
        // Remove the locally saved temporary file as the upload operation got rejected or cancelled:
        if (localFilePath) fs.unlinkSync(localFilePath);
        console.log("File upload error", error);
        return null;
    }
};
const deleteFileFromCloudinary = async (publicId, resource) => {
    try {
        if (!publicId) return null
        // Delete the file from Cloudinary:
        const fileDeletedResponse = await cloudinary.uploader.destroy(publicId, {
            resource_type: resource
        });
        if (fileDeletedResponse.result === "not found") {
            console.log("File has not been deleted successfully", fileDeletedResponse);
        }
        console.log("File has been deleted successfully", fileDeletedResponse);
        // File has been deleted successfully:
        return fileDeletedResponse;
    } catch (error) {
        console.log("File delete error", error);
        return null;
    }
};




export { fileUploadOnCloudinary, deleteFileFromCloudinary };