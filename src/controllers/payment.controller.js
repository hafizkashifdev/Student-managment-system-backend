import * as paymentService from '../services/payment.service.js';
import { queueWhatsApp } from '../services/notification.service.js';
import { feeReceiptTemplate } from '../utils/urduMessages.js';
import { renderTemplate, generateAndUploadPDF } from '../services/pdf.service.js';
import { formatDate } from '../utils/dateHelper.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import FeePayment from '../models/FeePayment.model.js';

export const recordPayment = asyncHandler(async (req, res) => {
  const { payment, student } = await paymentService.recordPayment(
    req.academyId,
    req.user._id.toString(),
    req.body
  );

  // Generate PDF receipt and send WhatsApp asynchronously
  setImmediate(async () => {
    try {
      const html = renderTemplate('fee-receipt.html', {
        academyName: req.academy.name,
        studentName: student.name,
        className: student.classId?.name || '',
        amount: payment.netPaid.toLocaleString(),
        month: payment.month,
        receiptNumber: payment.receiptNumber,
        date: formatDate(new Date()),
        paymentMethod: payment.paymentMethod,
      });

      const receiptUrl = await generateAndUploadPDF(html, `receipts/${payment.receiptNumber}`);
      await FeePayment.findByIdAndUpdate(payment._id, { receiptUrl, whatsappSent: false });

      const phone = student.parent?.primaryWhatsapp;
      if (phone) {
        const body = feeReceiptTemplate({
          academyName: req.academy.name,
          studentName: student.name,
          className: student.classId?.name || '',
          amount: payment.netPaid,
          month: payment.month,
          receiptNumber: payment.receiptNumber,
          date: formatDate(new Date()),
          receiptUrl,
        });
        await queueWhatsApp(phone, body, {
          academyId: req.academyId,
          subType: 'fee_receipt',
          relatedId: payment._id,
          relatedModel: 'FeePayment',
        });
        await FeePayment.findByIdAndUpdate(payment._id, { whatsappSent: true });
      }
    } catch {
      // Non-critical — payment is already recorded
    }
  });

  res.status(201).json(new ApiResponse(201, payment, 'Payment recorded'));
});

export const listPayments = asyncHandler(async (req, res) => {
  const { payments, meta } = await paymentService.listPayments(req.academyId, req.query);
  res.json(new ApiResponse(200, payments, 'Payments fetched', meta));
});

export const getPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.getPaymentById(req.academyId, req.params.id);
  res.json(new ApiResponse(200, payment, 'Payment fetched'));
});

export const downloadReceipt = asyncHandler(async (req, res) => {
  const payment = await paymentService.getPaymentById(req.academyId, req.params.id);
  if (!payment.receiptUrl) {
    const { ApiError } = await import('../utils/ApiError.js');
    throw new ApiError(404, 'Receipt not yet generated');
  }
  res.redirect(payment.receiptUrl);
});
