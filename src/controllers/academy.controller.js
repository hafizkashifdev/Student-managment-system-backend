import Academy from '../models/Academy.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFoundError } from '../utils/ApiError.js';
import { cloudinary } from '../config/cloudinary.js';
import streamifier from 'streamifier';

export const getAcademy = asyncHandler(async (req, res) => {
  const academy = await Academy.findById(req.academyId).lean();
  if (!academy) throw new NotFoundError('Academy');
  res.json(new ApiResponse(200, academy, 'Academy fetched'));
});

export const updateAcademy = asyncHandler(async (req, res) => {
  const { name, ownerName, whatsappNumber, address, settings } = req.body;
  const academy = await Academy.findByIdAndUpdate(
    req.academyId,
    { name, ownerName, whatsappNumber, address, settings },
    { new: true, runValidators: true }
  ).lean();
  if (!academy) throw new NotFoundError('Academy');
  res.json(new ApiResponse(200, academy, 'Academy updated'));
});

export const uploadLogo = asyncHandler(async (req, res) => {
  const { ApiError } = await import('../utils/ApiError.js');
  if (!req.file) throw new ApiError(400, 'No file uploaded');

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'sms/logos', public_id: req.academyId, overwrite: true },
      (err, res) => (err ? reject(err) : resolve(res))
    );
    streamifier.createReadStream(req.file.buffer).pipe(stream);
  });

  await Academy.findByIdAndUpdate(req.academyId, { logo: result.secure_url });
  res.json(new ApiResponse(200, { logo: result.secure_url }, 'Logo uploaded'));
});
