export const ROLES = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  TEACHER: 'teacher',
  ACCOUNTANT: 'accountant',
  RECEPTIONIST: 'receptionist',
});

export const PERMISSIONS = Object.freeze({
  ALL: '*',
  STUDENT_READ: 'student:read',
  STUDENT_WRITE: 'student:write',
  STUDENT_DELETE: 'student:delete',
  TEACHER_READ: 'teacher:read',
  TEACHER_WRITE: 'teacher:write',
  ATTENDANCE_MARK: 'attendance:mark',
  ATTENDANCE_READ: 'attendance:read',
  FEE_READ: 'fee:read',
  FEE_WRITE: 'fee:write',
  PAYMENT_READ: 'payment:read',
  PAYMENT_WRITE: 'payment:write',
  REPORT_READ: 'report:read',
  REPORT_WRITE: 'report:write',
  WHATSAPP_SEND: 'whatsapp:send',
  ACADEMY_MANAGE: 'academy:manage',
  USER_MANAGE: 'user:manage',
});

export const ROLE_PERMISSIONS = Object.freeze({
  [ROLES.SUPER_ADMIN]: ['*'],
  [ROLES.ADMIN]: ['*'],
  [ROLES.TEACHER]: [
    PERMISSIONS.ATTENDANCE_MARK,
    PERMISSIONS.ATTENDANCE_READ,
    PERMISSIONS.STUDENT_READ,
  ],
  [ROLES.ACCOUNTANT]: [
    PERMISSIONS.FEE_READ,
    PERMISSIONS.FEE_WRITE,
    PERMISSIONS.PAYMENT_READ,
    PERMISSIONS.PAYMENT_WRITE,
    PERMISSIONS.REPORT_READ,
    PERMISSIONS.STUDENT_READ,
  ],
  [ROLES.RECEPTIONIST]: [
    PERMISSIONS.STUDENT_READ,
    PERMISSIONS.ATTENDANCE_READ,
  ],
});

export const SUBSCRIPTION_PLANS = Object.freeze({
  FREE: 'free',
  BASIC: 'basic',
  STANDARD: 'standard',
  PREMIUM: 'premium',
});

export const STUDENT_STATUS = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  GRADUATED: 'graduated',
  TRANSFERRED: 'transferred',
});

export const ATTENDANCE_STATUS = Object.freeze({
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  LEAVE: 'leave',
});

export const PAYMENT_METHODS = Object.freeze({
  CASH: 'cash',
  BANK: 'bank',
  EASYPAISA: 'easypaisa',
  JAZZCASH: 'jazzcash',
});

export const CACHE_TTL = Object.freeze({
  DASHBOARD: 300,   // 5 minutes
  STUDENT_LIST: 120, // 2 minutes
  WHATSAPP_TEMPLATE: 3600, // 1 hour
  FEE_SUMMARY: 300,
});

export const QUEUE_NAMES = Object.freeze({
  WHATSAPP: 'whatsapp',
  FEE_REMINDER: 'fee-reminder',
  REPORT: 'report',
});
