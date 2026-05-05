import * as subscriptionService from '../services/subscription.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getSubscription = asyncHandler(async (req, res) => {
  const sub = await subscriptionService.getSubscription(req.academyId);
  res.json(new ApiResponse(200, sub, 'Subscription fetched'));
});

export const updateSubscription = asyncHandler(async (req, res) => {
  const sub = await subscriptionService.updateSubscription(req.academyId, req.body);
  res.json(new ApiResponse(200, sub, 'Subscription updated'));
});
