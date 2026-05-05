import { v2 as cloudinary } from 'cloudinary';
import { env } from './environment.js';
import { logger } from './logger.js';

/**
 * Configure Cloudinary SDK with credentials from environment.
 */
export function configureCloudinary() {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    logger.warn('Cloudinary credentials not fully set — file uploads will fail');
    return;
  }

  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  logger.info('Cloudinary configured');
}

export { cloudinary };
