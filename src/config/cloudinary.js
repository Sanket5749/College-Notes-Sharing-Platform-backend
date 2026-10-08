import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

// Configure Cloudinary from environment variables
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL,
    secure: true,
  });
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Check if Cloudinary credentials are fully configured
 */
export const isCloudinaryConfigured = () => {
  if (process.env.CLOUDINARY_URL) return true;
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

if (!isCloudinaryConfigured()) {
  console.warn(
    '[WARNING] Missing Cloudinary configuration. Please set CLOUDINARY_CLOUD_NAME, ' +
    'CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET (or CLOUDINARY_URL) in backend/.env'
  );
}

/**
 * Upload a PDF file buffer to Cloudinary using upload_stream
 * @param {Buffer} buffer - File buffer from Multer memoryStorage
 * @param {Object} options - Upload options (folder, public_id, etc.)
 * @returns {Promise<Object>} Cloudinary upload result
 */
export const uploadPdfToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      return reject(
        new Error(
          'Cloudinary is not configured. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your .env file.'
        )
      );
    }

    const uploadOptions = {
      resource_type: 'auto',  // Cloudinary auto-detects; PDFs are stored as 'image'
      folder: options.folder || 'college_notes',
      public_id: options.public_id,
      ...(process.env.CLOUDINARY_UPLOAD_PRESET ? { upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET } : {}),
      ...options,
    };

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          if (
            error.http_code === 403 ||
            (error.message && error.message.includes('missing permissions'))
          ) {
            const permissionError = new Error(
              'Cloudinary API Key lacks upload permissions (actions=["create"]). ' +
              'Please open your Cloudinary Dashboard -> Settings -> Access Keys, and ensure this API Key has Write/Upload permissions enabled, or generate a Master/Full-Access API Key.'
            );
            permissionError.statusCode = 403;
            permissionError.originalError = error;
            return reject(permissionError);
          }
          return reject(error);
        }
        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

/**
 * Delete a file from Cloudinary by its public_id
 * @param {string} publicId - Cloudinary asset public ID
 * @param {string} resourceType - 'image' | 'raw' | 'auto'
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  if (!publicId || !isCloudinaryConfigured()) return;

  try {
    // PDFs stored with resource_type:'auto' are classified as 'image' by Cloudinary
    const res = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    if (res.result === 'not found' && resourceType !== 'raw') {
      // Fallback: try 'raw' in case the asset was stored differently
      await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    }
    return res;
  } catch (error) {
    console.warn(`[CLOUDINARY WARNING] Failed to delete file ${publicId}:`, error.message);
  }
};

/**
 * Generate a signed download URL with fl_attachment to prompt PDF download.
 * PDFs uploaded with resource_type:'auto' are stored as 'image' by Cloudinary.
 * sign_url:true generates a signed URL so restricted/private assets are accessible.
 * @param {string} publicId - Cloudinary asset public ID
 * @param {string} fileName - Original file name for browser download prompt
 * @param {string} fallbackUrl - Fallback secure_url stored in DB
 */
export const getCloudinaryDownloadUrl = (publicId, fileName = 'document.pdf', fallbackUrl = '') => {
  if (!isCloudinaryConfigured()) {
    return fallbackUrl;
  }

  // If no publicId, inject fl_attachment into the stored secure_url path
  if (!publicId) {
    if (!fallbackUrl) return fallbackUrl;
    try {
      const url = new URL(fallbackUrl);
      url.pathname = url.pathname.replace('/upload/', '/upload/fl_attachment/');
      return url.toString();
    } catch {
      return fallbackUrl;
    }
  }

  try {
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    // PDFs with resource_type:'auto' are stored as 'image' in Cloudinary.
    // sign_url generates a signed delivery URL that bypasses access restrictions.
    const downloadUrl = cloudinary.url(publicId, {
      flags: `attachment:${cleanFileName}`,
      resource_type: 'image',
      secure: true,
      sign_url: true,
    });
    return downloadUrl || fallbackUrl;
  } catch {
    // Last resort: inject fl_attachment into the stored secure_url
    try {
      const url = new URL(fallbackUrl);
      url.pathname = url.pathname.replace('/upload/', '/upload/fl_attachment/');
      return url.toString();
    } catch {
      return fallbackUrl;
    }
  }
};

export default cloudinary;
