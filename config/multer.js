import multer from "multer";
import fs from "fs";
import path from "path";

// 1. Ensure the temp local directory exists before saving files
// (This is just a waiting room, files will be deleted right after going to ImageKit)
const uploadDir = "uploads/resumes/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Configure Disk Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Sanitize original name and add a timestamp to prevent file overwriting locally
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const cleanExtension = path.extname(file.originalname);
    cb(null, `resume-${req.user._id}-${uniqueSuffix}${cleanExtension}`);
  },
});

// 3. Configure Upload Middleware with Security Filters
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit: 5MB max
  },
  fileFilter: function (req, file, cb) {
    // Production security: Only accept specific image formats
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid file type! Only JPG, PNG, and WebP are allowed."),
        false,
      );
    }
  },
});

export default upload;
