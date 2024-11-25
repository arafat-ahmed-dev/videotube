import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Store files temporarily in public/temp before uploading to cloudinary
        cb(null, "./public/temp");
    },
    filename: function (req, file, cb) {
        // Keep original filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix);
    }
});

const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedFileTypes = {
        'image': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        'video': ['video/mp4', 'video/mpeg', 'video/quicktime']
    };

    // Check if file type is allowed
    const isAllowedImage = allowedFileTypes.image.includes(file.mimetype);
    const isAllowedVideo = allowedFileTypes.video.includes(file.mimetype);

    if (isAllowedImage || isAllowedVideo) {
        cb(null, true); // Accept file
    } else {
        cb(new Error("Unsupported file format. Upload only images and videos"), false);
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50mb max file size
    }
});
