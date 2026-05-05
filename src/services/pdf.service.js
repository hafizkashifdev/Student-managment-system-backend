import puppeteer from 'puppeteer';
import { cloudinary } from '../config/cloudinary.js';
import { logger } from '../config/logger.js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import streamifier from 'streamifier';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Generate a PDF from an HTML template and upload to Cloudinary.
 * @param {string} html - Rendered HTML string
 * @param {string} filename - Used as Cloudinary public_id
 * @returns {Promise<string>} Cloudinary secure URL
 */
export async function generateAndUploadPDF(html, filename) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  let pdfBuffer;
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '1cm', bottom: '1cm', left: '1cm', right: '1cm' } });
  } finally {
    await browser.close();
  }

  const url = await uploadPDFBuffer(pdfBuffer, filename);
  logger.info(`PDF generated and uploaded: ${url}`);
  return url;
}

/**
 * Upload a PDF buffer to Cloudinary.
 * @param {Buffer} buffer
 * @param {string} publicId
 * @returns {Promise<string>}
 */
async function uploadPDFBuffer(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'raw', folder: 'sms/receipts', public_id: publicId, format: 'pdf' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

/**
 * Load an HTML template file and replace {{variable}} placeholders.
 * @param {string} templateName - filename without path
 * @param {object} vars
 * @returns {string}
 */
export function renderTemplate(templateName, vars) {
  const templatePath = resolve(__dirname, '../templates/pdf', templateName);
  let html = readFileSync(templatePath, 'utf-8');

  for (const [key, val] of Object.entries(vars)) {
    html = html.replaceAll(`{{${key}}}`, val ?? '');
  }

  return html;
}
