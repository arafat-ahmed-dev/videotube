import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async file => {
  try {
    if (!file) return null;

    const response = await cloudinary.uploader.upload(file, {
      resource_type: "auto", // Automatically detects and handles images/videos
    });

    // Remove the file after uploading
    await fs.unlink(file);

    return response;
  } catch (error) {
    // Ensure the file is removed even on failure
    await fs.unlink(file).catch(() => {
      console.warn("Failed to delete file after error:", file);
    });
    console.error("Cloudinary upload failed:", error);
    return null;
  }
};

const deleteCloudinaryImage = async publicId => {
  try {
    if (!publicId) return null;

    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: "auto", // Handles videos as well
    });

    return response;
  } catch (error) {
    console.error("Cloudinary resource deletion failed:", error);
    return null;
  }
};

export { uploadOnCloudinary, deleteCloudinaryImage };
