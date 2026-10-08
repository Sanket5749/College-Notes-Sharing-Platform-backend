import multer from 'multer';
import path from 'path';

// 10 MB maximum file size limit
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Use memory storage so we can stream buffer directly to Cloudinary
const storage = multer.memoryStorage();

/**
 * Filter function to strictly enforce PDF format via MIME type and file extension.
 */
const fileFilter = (req, file, cb) => {
  const fileExt = path.extname(file.originalname).toLowerCase();
  const isMimePdf = file.mimetype === 'application/pdf';
  const isExtPdf = fileExt === '.pdf';

  if (isMimePdf && isExtPdf) {
    return cb(null, true);
  }

  const error = new Error('Invalid file type. Only PDF documents (.pdf) are allowed.');
  error.statusCode = 400;
  cb(error, false);
};

export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1, // Single file upload per request
  },
  fileFilter,
});

/**
 * Express middleware wrapper to catch Multer errors (e.g. file size limit, unexpected fields)
 * and forward clear JSON responses.
 */
export const uploadPdfMiddleware = (fieldName = 'file') => {
  const multerSingle = upload.single(fieldName);

  return (req, res, next) => {
    multerSingle(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: `File size too large. Maximum allowed size is ${MAX_FILE_SIZE / (1024 * 1024)} MB.`,
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`,
        });
      } else if (err) {
        return res.status(err.statusCode || 400).json({
          success: false,
          message: err.message || 'File upload failed.',
        });
      }
      next();
    });
  };
};

export default uploadPdfMiddleware;
