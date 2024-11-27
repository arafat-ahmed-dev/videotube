import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (file) => {
  try {
    if (!file) return null;
    const response = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
    });
    fs.unlinkSync(file);
    return response;
  } catch (error) {
    fs.unlinkSync(file);
    console.error("Cloudinary upload failed:", error);
    return null;
  }
};

const deleteCloudinaryImage = async (file) => {
  try {
    if (!file) return null;
    const response = await cloudinary.uploader.destroy(file);
    return response;
  } catch (error) {
    console.error("Cloudinary image deletion failed:", error);
    return null;
  }
};

export { uploadOnCloudinary, deleteCloudinaryImage };
