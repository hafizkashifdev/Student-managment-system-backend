import { generateMonthlyReport } from '../services/report.service.js';
import { getReportQueue } from '../jobs/queues/report.queue.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { toMonthString } from '../utils/dateHelper.js';

export const getMonthlyReport = asyncHandler(async (req, res) => {
  const month = req.query.month || toMonthString(new Date());
  const queue = getReportQueue();

  const job = await queue.add({
    academyId: req.academyId,
    month,
    type: 'monthly',
  });

  res.json(new ApiResponse(200, { jobId: job.id, month }, 'Report generation queued. Poll /reports/status/:jobId for result.'));
});

export const getReportJobStatus = asyncHandler(async (req, res) => {
  const queue = getReportQueue();
  const job = await queue.getJob(req.params.jobId);

  if (!job) {
    const { NotFoundError } = await import('../utils/ApiError.js');
    throw new NotFoundError('Job');
  }

  const state = await job.getState();
  const result = job.returnvalue;

  res.json(new ApiResponse(200, { jobId: job.id, state, result }, 'Job status fetched'));
});

export const getFeeCollectionReport = asyncHandler(async (req, res) => {
  const { getFeeSummary } = await import('../services/fee.service.js');
  const month = req.query.month || toMonthString(new Date());
  const summary = await getFeeSummary(req.academyId, month);
  res.json(new ApiResponse(200, summary, 'Fee collection report fetched'));
});
