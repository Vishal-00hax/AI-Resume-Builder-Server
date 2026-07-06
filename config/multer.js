import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {},
  filename: function (req, file, cb) {},
});

const upload = multer({ storage });

export default upload;
