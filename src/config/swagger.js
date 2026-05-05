const bearerAuth = { bearerAuth: [] };

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'SMS Backend API',
    version: '1.0.0',
    description:
      'School/Academy Management SaaS API for Pakistani Academies.\n\n' +
      '**Auth flow:** Call `POST /auth/login` → copy the `accessToken` → click **Authorize** (top right) → paste token.',
  },
  servers: [{ url: 'http://localhost:5000/api/v1', description: 'Local dev' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          statusCode: { type: 'integer', example: 400 },
          message: { type: 'string' },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          total: { type: 'integer' },
          page: { type: 'integer' },
          limit: { type: 'integer' },
          pages: { type: 'integer' },
        },
      },
    },
  },
  security: [bearerAuth],
  paths: {

    // ─── Auth ───────────────────────────────────────────────────────────────
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new academy + admin account',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password', 'phone', 'academyName', 'city'],
                properties: {
                  name: { type: 'string', example: 'Ahmed Ali' },
                  email: { type: 'string', format: 'email', example: 'admin@academy.com' },
                  password: { type: 'string', minLength: 8, example: 'Secret123!' },
                  phone: { type: 'string', example: '03001234567' },
                  academyName: { type: 'string', example: 'Al-Noor Academy' },
                  city: { type: 'string', example: 'Lahore' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Academy and admin created' },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and receive JWT tokens',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'admin@academy.com' },
                  password: { type: 'string', example: 'Secret123!' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    accessToken: { type: 'string' },
                    refreshToken: { type: 'string' },
                    user: { type: 'object' },
                  },
                },
              },
            },
          },
          401: { description: 'Invalid credentials' },
        },
      },
    },

    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: { refreshToken: { type: 'string' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'New access token issued' },
          401: { description: 'Invalid or expired refresh token' },
        },
      },
    },

    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Invalidate current session',
        responses: { 200: { description: 'Logged out' } },
      },
    },

    '/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Request a password reset link',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: { email: { type: 'string', format: 'email' } },
              },
            },
          },
        },
        responses: { 200: { description: 'Reset email sent if account exists' } },
      },
    },

    '/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Reset password using token from email',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token', 'password'],
                properties: {
                  token: { type: 'string' },
                  password: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Password reset successful' } },
      },
    },

    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current logged-in user profile',
        responses: { 200: { description: 'User profile' } },
      },
    },

    '/auth/change-password': {
      patch: {
        tags: ['Auth'],
        summary: 'Change password (requires old password)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                  currentPassword: { type: 'string' },
                  newPassword: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Password changed' } },
      },
    },

    // ─── Academy ────────────────────────────────────────────────────────────
    '/academy': {
      get: {
        tags: ['Academy'],
        summary: 'Get academy profile',
        responses: { 200: { description: 'Academy details' } },
      },
      patch: {
        tags: ['Academy'],
        summary: 'Update academy profile (Admin only)',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  city: { type: 'string' },
                  address: { type: 'string' },
                  phone: { type: 'string' },
                  whatsappNumber: { type: 'string' },
                  settings: { type: 'object' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Academy updated' } },
      },
    },

    '/academy/logo': {
      post: {
        tags: ['Academy'],
        summary: 'Upload academy logo (Admin only)',
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: { logo: { type: 'string', format: 'binary' } },
              },
            },
          },
        },
        responses: { 200: { description: 'Logo uploaded, URL returned' } },
      },
    },

    // ─── Students ───────────────────────────────────────────────────────────
    '/students': {
      get: {
        tags: ['Students'],
        summary: 'List students with filters & pagination',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'classId', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['active', 'inactive'] } },
        ],
        responses: { 200: { description: 'Paginated student list' } },
      },
      post: {
        tags: ['Students'],
        summary: 'Create a new student',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'classId', 'dateOfBirth'],
                properties: {
                  name: { type: 'string', example: 'Usman Khan' },
                  classId: { type: 'string', example: '665a1234abcd1234abcd1234' },
                  dateOfBirth: { type: 'string', format: 'date', example: '2010-03-15' },
                  rollNumber: { type: 'string' },
                  gender: { type: 'string', enum: ['male', 'female'] },
                  parent: {
                    type: 'object',
                    properties: {
                      fatherName: { type: 'string' },
                      primaryWhatsapp: { type: 'string', example: '03001234567' },
                      cnic: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Student created' } },
      },
    },

    '/students/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: {
        tags: ['Students'],
        summary: 'Get a single student',
        responses: { 200: { description: 'Student object' }, 404: { description: 'Not found' } },
      },
      patch: {
        tags: ['Students'],
        summary: 'Update student details',
        requestBody: {
          content: {
            'application/json': {
              schema: { type: 'object', properties: { name: { type: 'string' }, classId: { type: 'string' } } },
            },
          },
        },
        responses: { 200: { description: 'Student updated' } },
      },
      delete: {
        tags: ['Students'],
        summary: 'Soft-delete a student',
        responses: { 200: { description: 'Student deleted' } },
      },
    },

    '/students/{id}/attendance': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: {
        tags: ['Students'],
        summary: "Get student's attendance history",
        parameters: [
          { name: 'month', in: 'query', schema: { type: 'string', example: '2026-05' } },
        ],
        responses: { 200: { description: 'Attendance records' } },
      },
    },

    '/students/{id}/fees': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: {
        tags: ['Students'],
        summary: "Get student's fee history",
        responses: { 200: { description: 'Fee records' } },
      },
    },

    '/students/{id}/photo': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      post: {
        tags: ['Students'],
        summary: 'Upload student profile photo',
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: { type: 'object', properties: { photo: { type: 'string', format: 'binary' } } },
            },
          },
        },
        responses: { 200: { description: 'Photo uploaded' } },
      },
    },

    // ─── Teachers ───────────────────────────────────────────────────────────
    '/teachers': {
      get: {
        tags: ['Teachers'],
        summary: 'List all teachers',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Teacher list' } },
      },
      post: {
        tags: ['Teachers'],
        summary: 'Add a new teacher',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'phone'],
                properties: {
                  name: { type: 'string', example: 'Miss Ayesha' },
                  phone: { type: 'string', example: '03111234567' },
                  whatsappNumber: { type: 'string' },
                  subject: { type: 'string' },
                  salary: { type: 'object', properties: { amount: { type: 'number' } } },
                  cnic: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Teacher created' } },
      },
    },

    '/teachers/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: {
        tags: ['Teachers'],
        summary: 'Get a single teacher',
        responses: { 200: { description: 'Teacher object' } },
      },
      patch: {
        tags: ['Teachers'],
        summary: 'Update teacher details',
        requestBody: {
          content: {
            'application/json': {
              schema: { type: 'object', properties: { name: { type: 'string' }, salary: { type: 'object' } } },
            },
          },
        },
        responses: { 200: { description: 'Teacher updated' } },
      },
    },

    '/teachers/{id}/salary': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      post: {
        tags: ['Teachers'],
        summary: 'Record salary payment for a teacher',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['amount', 'month'],
                properties: {
                  amount: { type: 'number', example: 25000 },
                  month: { type: 'string', example: '2026-05' },
                  note: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Salary recorded' } },
      },
    },

    // ─── Attendance ─────────────────────────────────────────────────────────
    '/attendance/mark': {
      post: {
        tags: ['Attendance'],
        summary: 'Mark attendance for a class or list of students',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['classId', 'date', 'records'],
                properties: {
                  classId: { type: 'string' },
                  date: { type: 'string', format: 'date', example: '2026-05-05' },
                  records: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        studentId: { type: 'string' },
                        status: { type: 'string', enum: ['present', 'absent', 'late'] },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Attendance marked' } },
      },
    },

    '/attendance/today': {
      get: {
        tags: ['Attendance'],
        summary: "Get today's attendance for all classes",
        responses: { 200: { description: 'Today attendance summary' } },
      },
    },

    '/attendance/class/{classId}': {
      parameters: [{ name: 'classId', in: 'path', required: true, schema: { type: 'string' } }],
      get: {
        tags: ['Attendance'],
        summary: 'Get attendance records for a class',
        parameters: [
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
        ],
        responses: { 200: { description: 'Class attendance records' } },
      },
    },

    '/attendance/student/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: {
        tags: ['Attendance'],
        summary: 'Get attendance records for a specific student',
        responses: { 200: { description: 'Student attendance' } },
      },
    },

    '/attendance/notify-absent': {
      post: {
        tags: ['Attendance'],
        summary: 'Send WhatsApp notifications to absent student parents',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['date'],
                properties: {
                  date: { type: 'string', format: 'date', example: '2026-05-05' },
                  classId: { type: 'string', description: 'Optional — notify for one class only' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Notifications queued' } },
      },
    },

    '/attendance/summary': {
      get: {
        tags: ['Attendance'],
        summary: 'Get attendance summary stats',
        parameters: [
          { name: 'month', in: 'query', schema: { type: 'string', example: '2026-05' } },
        ],
        responses: { 200: { description: 'Summary object' } },
      },
    },

    // ─── Fees ───────────────────────────────────────────────────────────────
    '/fees/plans': {
      get: {
        tags: ['Fees'],
        summary: 'List all fee plans',
        responses: { 200: { description: 'Fee plan list' } },
      },
      post: {
        tags: ['Fees'],
        summary: 'Create a new fee plan',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'monthlyAmount'],
                properties: {
                  name: { type: 'string', example: 'Class 5 Fee' },
                  monthlyAmount: { type: 'number', example: 2000 },
                  dueDay: { type: 'integer', example: 10, description: 'Day of month fee is due' },
                  lateFee: { type: 'number', example: 200 },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Fee plan created' } },
      },
    },

    '/fees/plans/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      patch: {
        tags: ['Fees'],
        summary: 'Update a fee plan',
        requestBody: {
          content: {
            'application/json': {
              schema: { type: 'object', properties: { monthlyAmount: { type: 'number' }, lateFee: { type: 'number' } } },
            },
          },
        },
        responses: { 200: { description: 'Fee plan updated' } },
      },
    },

    '/fees/pending': {
      get: {
        tags: ['Fees'],
        summary: 'List students with pending fees',
        parameters: [
          { name: 'month', in: 'query', schema: { type: 'string', example: '2026-05' } },
          { name: 'classId', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Pending fee records' } },
      },
    },

    '/fees/defaulters': {
      get: {
        tags: ['Fees'],
        summary: 'List fee defaulters (2+ months unpaid)',
        responses: { 200: { description: 'Defaulter list' } },
      },
    },

    '/fees/summary': {
      get: {
        tags: ['Fees'],
        summary: 'Monthly fee collection summary',
        parameters: [
          { name: 'month', in: 'query', schema: { type: 'string', example: '2026-05' } },
        ],
        responses: { 200: { description: 'Summary stats' } },
      },
    },

    '/fees/remind': {
      post: {
        tags: ['Fees'],
        summary: 'Send WhatsApp fee reminders',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['month'],
                properties: {
                  month: { type: 'string', example: '2026-05' },
                  classId: { type: 'string', description: 'Optional — one class only' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Reminders queued' } },
      },
    },

    // ─── Payments ───────────────────────────────────────────────────────────
    '/payments': {
      post: {
        tags: ['Payments'],
        summary: 'Record a fee payment',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['studentId', 'amount', 'month'],
                properties: {
                  studentId: { type: 'string' },
                  amount: { type: 'number', example: 2000 },
                  month: { type: 'string', example: '2026-05' },
                  paymentMethod: { type: 'string', enum: ['cash', 'bank', 'easypaisa', 'jazzcash'], default: 'cash' },
                  note: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Payment recorded, receipt URL returned' } },
      },
      get: {
        tags: ['Payments'],
        summary: 'List payments with filters',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'month', in: 'query', schema: { type: 'string' } },
          { name: 'studentId', in: 'query', schema: { type: 'string' } },
          { name: 'method', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Paginated payment list' } },
      },
    },

    '/payments/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: {
        tags: ['Payments'],
        summary: 'Get a single payment record',
        responses: { 200: { description: 'Payment object' } },
      },
    },

    '/payments/{id}/receipt': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: {
        tags: ['Payments'],
        summary: 'Download PDF receipt for a payment',
        responses: { 200: { description: 'PDF file or Cloudinary URL' } },
      },
    },

    // ─── WhatsApp ────────────────────────────────────────────────────────────
    '/whatsapp/send': {
      post: {
        tags: ['WhatsApp'],
        summary: 'Send a single WhatsApp message',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['to', 'body'],
                properties: {
                  to: { type: 'string', example: '923001234567', description: 'Phone with country code, no +' },
                  body: { type: 'string', example: 'آپ کا فیس ادا کریں' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Message queued / sent' } },
      },
    },

    '/whatsapp/bulk': {
      post: {
        tags: ['WhatsApp'],
        summary: 'Send bulk WhatsApp messages',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['messages'],
                properties: {
                  messages: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        to: { type: 'string' },
                        body: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Bulk messages queued' } },
      },
    },

    '/whatsapp/logs': {
      get: {
        tags: ['WhatsApp'],
        summary: 'Get WhatsApp message logs',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['queued', 'sent', 'failed'] } },
        ],
        responses: { 200: { description: 'Message log list' } },
      },
    },

    '/whatsapp/stats': {
      get: {
        tags: ['WhatsApp'],
        summary: 'WhatsApp usage statistics',
        responses: { 200: { description: 'Stats object' } },
      },
    },

    '/whatsapp/test': {
      get: {
        tags: ['WhatsApp'],
        summary: 'Test Twilio WhatsApp connection',
        responses: { 200: { description: 'Connection status' } },
      },
    },

    // ─── Reports ────────────────────────────────────────────────────────────
    '/reports/monthly': {
      get: {
        tags: ['Reports'],
        summary: 'Generate (or fetch cached) monthly report',
        parameters: [
          { name: 'month', in: 'query', required: true, schema: { type: 'string', example: '2026-05' } },
        ],
        responses: { 200: { description: 'Report URL or inline data' } },
      },
    },

    '/reports/status/{jobId}': {
      parameters: [{ name: 'jobId', in: 'path', required: true, schema: { type: 'string' } }],
      get: {
        tags: ['Reports'],
        summary: 'Poll async report job status',
        responses: {
          200: {
            description: 'Job status',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', enum: ['waiting', 'active', 'completed', 'failed'] },
                    url: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/reports/fee-collection': {
      get: {
        tags: ['Reports'],
        summary: 'Fee collection report',
        parameters: [
          { name: 'month', in: 'query', schema: { type: 'string', example: '2026-05' } },
          { name: 'classId', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Fee collection data' } },
      },
    },

    // ─── Dashboard ──────────────────────────────────────────────────────────
    '/dashboard/stats': {
      get: {
        tags: ['Dashboard'],
        summary: 'Overall academy stats (students, teachers, revenue)',
        responses: { 200: { description: 'Stats object' } },
      },
    },

    '/dashboard/revenue': {
      get: {
        tags: ['Dashboard'],
        summary: 'Revenue chart data',
        parameters: [
          { name: 'months', in: 'query', schema: { type: 'integer', default: 6 } },
        ],
        responses: { 200: { description: 'Monthly revenue array' } },
      },
    },

    '/dashboard/recent-activity': {
      get: {
        tags: ['Dashboard'],
        summary: 'Recent audit log activity',
        responses: { 200: { description: 'Activity list' } },
      },
    },

    '/dashboard/alerts': {
      get: {
        tags: ['Dashboard'],
        summary: 'Active alerts (defaulters, low attendance, etc.)',
        responses: { 200: { description: 'Alert list' } },
      },
    },

    // ─── Subscription ────────────────────────────────────────────────────────
    '/subscription': {
      get: {
        tags: ['Subscription'],
        summary: 'Get current subscription plan',
        responses: { 200: { description: 'Subscription object' } },
      },
    },

    '/subscription/upgrade': {
      post: {
        tags: ['Subscription'],
        summary: 'Upgrade or change subscription plan (Admin only)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['plan'],
                properties: {
                  plan: { type: 'string', enum: ['basic', 'pro', 'enterprise'] },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Subscription updated' } },
      },
    },
  },
};
