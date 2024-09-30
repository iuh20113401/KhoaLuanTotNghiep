const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/tailieu'); // Set the upload directory
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`); // Set the file name
  },
});
function checkFileType(file, cb) {
  // Allowed file types
  const filetypes =
    /jpeg|jpg|png|pdf|docx|application\/vnd.openxmlformats-officedocument.wordprocessingml.document/;
  // Check file extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype.toLowerCase());
  console.log(file);
  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Files of type /jpeg|jpg|png|pdf|docx/ only!'));
}
exports.upload = multer({
  storage: storage,
  limits: { fileSize: 100000000 }, // Set file size limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single('taiLieu');

// Cấu hình multer để lưu ảnh
const storageHinhAnh = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/hinhanh'); // Thư mục để lưu ảnh
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`,
    );
  },
});
function checkFileTypeHinhAnh(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  }
  cb('Error: Images Only!');
}

exports.uploadHinhAnh = multer({
  storage: storageHinhAnh,
  limits: { fileSize: 20 * 1024 * 1024 }, // Max size 5MB
  fileFilter: function (req, file, cb) {
    checkFileTypeHinhAnh(file, cb);
  },
}).single('hinhAnh');
