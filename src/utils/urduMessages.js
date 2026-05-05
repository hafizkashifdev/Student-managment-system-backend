/**
 * Urdu WhatsApp message templates for Pakistani academies.
 * All templates return formatted strings with dynamic variables.
 */

/**
 * @param {object} params
 * @returns {string}
 */
export function feeReminderTemplate({ academyName, parentName, studentName, className, amount, month, dueDate }) {
  return `🏫 *${academyName}*
Assalam o Alaikum ${parentName} Sahab!

📚 Student: *${studentName}*
🎓 Class: ${className}
💰 Fee: *Rs ${amount.toLocaleString()}*
📅 Month: ${month}
⚠️ Due Date: ${dueDate}

Meherbani farma kar fees jama karwa den.
Shukriya! 🙏`;
}

/**
 * @param {object} params
 * @returns {string}
 */
export function absentAlertTemplate({ academyName, studentName, date, academyWhatsapp }) {
  return `🏫 *${academyName}*
Assalam o Alaikum!

⚠️ *Ghair Hazri Ki Ittila*
📚 ${studentName} aaj *${date}* ko school nahi aye.

Agar koi wajah hai to please inform karen:
📞 ${academyWhatsapp}

JazakAllah Khair 🙏`;
}

/**
 * @param {object} params
 * @returns {string}
 */
export function feeReceiptTemplate({ academyName, studentName, className, amount, month, receiptNumber, date, receiptUrl }) {
  return `🏫 *${academyName}*
✅ *Fee Raseed*

📚 Student: ${studentName}
🎓 Class: ${className}
💰 Rakam: *Rs ${amount.toLocaleString()}*
📅 Mahina: ${month}
🧾 Raseed No: ${receiptNumber}
📆 Tarikh: ${date}

Fee ada karne ka shukriya! 🙏
PDF raseed neeche link mein hai:
${receiptUrl}`;
}

/**
 * @param {object} params
 * @returns {string}
 */
export function salarySlipTemplate({ academyName, teacherName, amount, month, date, slipUrl }) {
  return `🏫 *${academyName}*
💼 *Salary Slip*

👨‍🏫 Teacher: *${teacherName}*
💰 Tankhwa: *Rs ${amount.toLocaleString()}*
📅 Mahina: ${month}
📆 Tarikh: ${date}

Salary Slip:
${slipUrl}

JazakAllah Khair 🙏`;
}

/**
 * @param {object} params
 * @returns {string}
 */
export function attendanceSummaryTemplate({ academyName, adminName, presentCount, absentCount, lateCount, date }) {
  return `🏫 *${academyName}*
📊 *Attendance Summary — ${date}*

✅ Hazir: *${presentCount}*
❌ Ghair Hazir: *${absentCount}*
⏰ Late: *${lateCount}*

Shukriya ${adminName} Sahab! 🙏`;
}
