import FeePayment from '../models/FeePayment.model.js';

/**
 * Generate a unique sequential receipt number: RCP-YYYY-00001
 * @param {string} academyId
 * @returns {Promise<string>}
 */
export async function generateReceiptNumber(academyId) {
  const year = new Date().getFullYear();
  const prefix = `RCP-${year}-`;

  const last = await FeePayment.findOne({ academyId, receiptNumber: { $regex: `^${prefix}` } })
    .sort({ receiptNumber: -1 })
    .select('receiptNumber')
    .lean();

  let seq = 1;
  if (last?.receiptNumber) {
    const parts = last.receiptNumber.split('-');
    seq = parseInt(parts[parts.length - 1], 10) + 1;
  }

  return `${prefix}${String(seq).padStart(5, '0')}`;
}

/**
 * Generate a unique sequential student admission number: ADM-YYYY-0001
 * @param {string} academyId
 * @returns {Promise<string>}
 */
export async function generateAdmissionNumber(academyId) {
  const Student = (await import('../models/Student.model.js')).default;
  const year = new Date().getFullYear();
  const prefix = `ADM-${year}-`;

  const last = await Student.findOne({ academyId, 'admission.number': { $regex: `^${prefix}` } })
    .sort({ 'admission.number': -1 })
    .select('admission.number')
    .lean();

  let seq = 1;
  if (last?.admission?.number) {
    const parts = last.admission.number.split('-');
    seq = parseInt(parts[parts.length - 1], 10) + 1;
  }

  return `${prefix}${String(seq).padStart(4, '0')}`;
}

/**
 * Generate a unique student ID: ACK-YYYY-0001
 * @param {string} academyId
 * @returns {Promise<string>}
 */
export async function generateStudentId(academyId) {
  const Student = (await import('../models/Student.model.js')).default;
  const year = new Date().getFullYear();
  const prefix = `ACK-${year}-`;

  const last = await Student.findOne({ academyId, studentId: { $regex: `^${prefix}` } })
    .sort({ studentId: -1 })
    .select('studentId')
    .lean();

  let seq = 1;
  if (last?.studentId) {
    const parts = last.studentId.split('-');
    seq = parseInt(parts[parts.length - 1], 10) + 1;
  }

  return `${prefix}${String(seq).padStart(4, '0')}`;
}
