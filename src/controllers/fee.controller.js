import * as feeService from '../services/fee.service.js';
import { queueBulkWhatsApp } from '../services/notification.service.js';
import { feeReminderTemplate } from '../utils/urduMessages.js';
import { formatDate, toMonthString } from '../utils/dateHelper.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listFeePlans = asyncHandler(async (req, res) => {
  const plans = await feeService.listFeePlans(req.academyId);
  res.json(new ApiResponse(200, plans, 'Fee plans fetched'));
});

export const createFeePlan = asyncHandler(async (req, res) => {
  const plan = await feeService.createFeePlan(req.academyId, req.body);
  res.status(201).json(new ApiResponse(201, plan, 'Fee plan created'));
});

export const updateFeePlan = asyncHandler(async (req, res) => {
  const plan = await feeService.updateFeePlan(req.academyId, req.params.id, req.body);
  res.json(new ApiResponse(200, plan, 'Fee plan updated'));
});

export const getPendingFees = asyncHandler(async (req, res) => {
  const result = await feeService.getPendingFees(req.academyId, req.query);
  res.json(new ApiResponse(200, result.students, 'Pending fees fetched', result.meta));
});

export const getFeeSummary = asyncHandler(async (req, res) => {
  const summary = await feeService.getFeeSummary(req.academyId, req.query.month);
  res.json(new ApiResponse(200, summary, 'Fee summary fetched'));
});

export const getFeeDefaulters = asyncHandler(async (req, res) => {
  const defaulters = await feeService.getFeeDefaulters(req.academyId, req.query);
  res.json(new ApiResponse(200, defaulters, 'Defaulters fetched'));
});

export const sendFeeReminders = asyncHandler(async (req, res) => {
  const { month, classId } = req.body;
  const { students } = await feeService.getPendingFees(req.academyId, { month, classId, limit: '500' });

  const messages = students
    .filter((s) => s.parent?.primaryWhatsapp)
    .map((s) => ({
      to: s.parent.primaryWhatsapp,
      body: feeReminderTemplate({
        academyName: req.academy.name,
        parentName: s.parent.fatherName || 'Walid',
        studentName: s.name,
        className: s.classId?.name || '',
        amount: s.fee?.netAmount || s.fee?.monthlyAmount || 0,
        month,
        dueDate: formatDate(new Date()),
      }),
      meta: { academyId: req.academyId, subType: 'fee_reminder', relatedId: s._id, relatedModel: 'Student' },
    }));

  await queueBulkWhatsApp(messages);
  res.json(new ApiResponse(200, { queued: messages.length }, `${messages.length} reminders queued`));
});
