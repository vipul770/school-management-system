function labelize(key) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function inferType(key, value) {
  if (key.includes("date")) return "date";
  if (key.includes("time")) return "time";
  if (key.includes("status")) return "select";
  if (key.endsWith("_id")) return "number";
  if (typeof value === "number") return "number";
  return "text";
}

function buildFields(template, overrides = {}, requiredKeys = []) {
  return Object.keys(template).map((key) => {
    const override = overrides[key] || {};
    return {
      name: key,
      label: override.label || labelize(key),
      type: override.type || inferType(key, template[key]),
      required: override.required ?? requiredKeys.includes(key),
      options: override.options || [],
      multiline: override.multiline || false,
    };
  });
}

const STATUS_OPTIONS = [
  "pending",
  "approved",
  "rejected",
  "draft",
  "issued",
  "partially_paid",
  "paid",
  "overdue",
  "present",
  "absent",
  "late",
  "excused",
  "submitted",
  "under_review",
];

const RAW_MODULES = [
  {
    slug: "admissions",
    title: "Admissions",
    listPath: "/schools/{school_id}/admissions",
    createPath: "/schools/{school_id}/admissions",
    updatePath: "/admissions/{id}",
    deletePath: "/admissions/{id}",
    template: { applicant_name: "", guardian_name: "", grade_applied: "", status: "submitted" },
    required: ["applicant_name"],
    overrides: { status: { type: "select", options: STATUS_OPTIONS } },
  },
  {
    slug: "classrooms",
    title: "Classrooms",
    listPath: "/schools/{school_id}/classrooms",
    createPath: "/schools/{school_id}/classrooms",
    updatePath: "/classrooms/{id}",
    deletePath: "/classrooms/{id}",
    template: { name: "" },
    required: ["name"],
  },
  {
    slug: "students",
    title: "Students",
    listPath: "/schools/{school_id}/students",
    createPath: "/schools/{school_id}/students",
    deletePath: "/students/{id}",
    template: { user_id: null },
    required: [],
  },
  {
    slug: "teachers",
    title: "Teachers",
    listPath: "/schools/{school_id}/teachers",
    createPath: "/schools/{school_id}/teachers",
    template: { username: "", password: "", full_name: "", email: "" },
    required: ["username", "password"],
  },
  {
    slug: "attendance",
    title: "Attendance",
    listPath: "/schools/{school_id}/attendance",
    createPath: "/schools/{school_id}/attendance",
    updatePath: "/attendance/{id}",
    deletePath: "/attendance/{id}",
    template: { student_id: null, date: "", status: "present", remarks: "" },
    required: ["date"],
    overrides: { status: { type: "select", options: STATUS_OPTIONS }, remarks: { multiline: true } },
  },
  {
    slug: "fee-invoices",
    title: "Fee Invoices",
    listPath: "/schools/{school_id}/fees/invoices",
    createPath: "/schools/{school_id}/fees/invoices",
    updatePath: "/fees/invoices/{id}",
    deletePath: "/fees/invoices/{id}",
    template: { student_id: null, amount: 0, due_date: "", status: "draft", description: "" },
    required: ["amount"],
    overrides: { status: { type: "select", options: STATUS_OPTIONS }, description: { multiline: true } },
  },
  {
    slug: "fee-payments",
    title: "Fee Payments",
    listPath: "/schools/{school_id}/fees/payments",
    createPath: "/schools/{school_id}/fees/payments",
    deletePath: "/fees/payments/{id}",
    template: { invoice_id: null, amount: 0, payment_date: "", reference: "" },
    required: ["amount"],
  },
  {
    slug: "exams",
    title: "Exams",
    listPath: "/schools/{school_id}/exams",
    createPath: "/schools/{school_id}/exams",
    updatePath: "/exams/{id}",
    deletePath: "/exams/{id}",
    template: { name: "", term: "", start_date: "", end_date: "" },
    required: ["name"],
  },
  {
    slug: "exam-results",
    title: "Exam Results",
    listPath: "/schools/{school_id}/exams/results",
    createPath: "/schools/{school_id}/exams/results",
    updatePath: "/exams/results/{id}",
    deletePath: "/exams/results/{id}",
    template: { exam_id: null, student_id: null, subject: "", score: 0, grade: "" },
    required: ["subject", "score"],
  },
  {
    slug: "timetable",
    title: "Timetable",
    listPath: "/schools/{school_id}/timetable",
    createPath: "/schools/{school_id}/timetable",
    updatePath: "/timetable/{id}",
    deletePath: "/timetable/{id}",
    template: { class_id: null, subject: "", teacher_id: null, day_of_week: "", start_time: "", end_time: "" },
    required: ["subject", "day_of_week", "start_time", "end_time"],
    overrides: {
      day_of_week: { type: "select", options: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] },
    },
  },
  {
    slug: "transport-routes",
    title: "Transport Routes",
    listPath: "/schools/{school_id}/transport/routes",
    createPath: "/schools/{school_id}/transport/routes",
    updatePath: "/transport/routes/{id}",
    deletePath: "/transport/routes/{id}",
    template: { name: "", description: "" },
    required: ["name"],
    overrides: { description: { multiline: true } },
  },
  {
    slug: "transport-vehicles",
    title: "Transport Vehicles",
    listPath: "/schools/{school_id}/transport/vehicles",
    createPath: "/schools/{school_id}/transport/vehicles",
    updatePath: "/transport/vehicles/{id}",
    deletePath: "/transport/vehicles/{id}",
    template: { registration_no: "", capacity: 0, driver_name: "" },
    required: ["registration_no"],
  },
  {
    slug: "transport-assignments",
    title: "Transport Assignments",
    listPath: "/schools/{school_id}/transport/assignments",
    createPath: "/schools/{school_id}/transport/assignments",
    deletePath: "/transport/assignments/{id}",
    template: { route_id: null, vehicle_id: null, student_id: null },
    required: [],
  },
  {
    slug: "library-books",
    title: "Library Books",
    listPath: "/schools/{school_id}/library/books",
    createPath: "/schools/{school_id}/library/books",
    updatePath: "/library/books/{id}",
    deletePath: "/library/books/{id}",
    template: { title: "", author: "", isbn: "", copies: 1 },
    required: ["title"],
  },
  {
    slug: "library-issues",
    title: "Library Issues",
    listPath: "/schools/{school_id}/library/issues",
    createPath: "/schools/{school_id}/library/issues",
    deletePath: "/library/issues/{id}",
    template: { book_id: null, student_id: null, issue_date: "", due_date: "", return_date: "" },
    required: ["book_id", "student_id", "issue_date", "due_date"],
  },
  {
    slug: "hostel-rooms",
    title: "Hostel Rooms",
    listPath: "/schools/{school_id}/hostel/rooms",
    createPath: "/schools/{school_id}/hostel/rooms",
    updatePath: "/hostel/rooms/{id}",
    deletePath: "/hostel/rooms/{id}",
    template: { room_no: "", capacity: 1 },
    required: ["room_no"],
  },
  {
    slug: "hostel-assignments",
    title: "Hostel Assignments",
    listPath: "/schools/{school_id}/hostel/assignments",
    createPath: "/schools/{school_id}/hostel/assignments",
    deletePath: "/hostel/assignments/{id}",
    template: { room_id: null, student_id: null, start_date: "", end_date: "" },
    required: ["room_id", "student_id", "start_date"],
  },
  {
    slug: "hr-employees",
    title: "HR Employees",
    listPath: "/schools/{school_id}/hr/employees",
    createPath: "/schools/{school_id}/hr/employees",
    updatePath: "/hr/employees/{id}",
    deletePath: "/hr/employees/{id}",
    template: { user_id: null, position: "", department: "", hire_date: "", salary: 0 },
    required: [],
  },
  {
    slug: "hr-payroll",
    title: "Payroll",
    listPath: "/schools/{school_id}/hr/payroll",
    createPath: "/schools/{school_id}/hr/payroll",
    deletePath: "/hr/payroll/{id}",
    template: { employee_id: null, period_start: "", period_end: "", gross_pay: 0, net_pay: 0, paid_date: "" },
    required: ["employee_id", "period_start", "period_end"],
  },
  {
    slug: "hr-leaves",
    title: "Leaves",
    listPath: "/schools/{school_id}/hr/leaves",
    createPath: "/schools/{school_id}/hr/leaves",
    updatePath: "/hr/leaves/{id}",
    deletePath: "/hr/leaves/{id}",
    template: { employee_id: null, start_date: "", end_date: "", reason: "", status: "pending" },
    required: ["employee_id", "start_date", "end_date"],
    overrides: { reason: { multiline: true }, status: { type: "select", options: STATUS_OPTIONS } },
  },
  {
    slug: "announcements",
    title: "Announcements",
    listPath: "/schools/{school_id}/messaging/announcements",
    createPath: "/schools/{school_id}/messaging/announcements",
    deletePath: "/messaging/announcements/{id}",
    template: { title: "", body: "" },
    required: ["title", "body"],
    overrides: { body: { multiline: true } },
  },
  {
    slug: "messages",
    title: "Direct Messages",
    listPath: "/schools/{school_id}/messaging/messages",
    createPath: "/schools/{school_id}/messaging/messages",
    deletePath: "/messaging/messages/{id}",
    template: { sender_id: null, recipient_id: null, body: "" },
    required: ["recipient_id", "body"],
    overrides: { body: { multiline: true } },
  },
  {
    slug: "analytics-metrics",
    title: "Analytics Metrics",
    listPath: "/schools/{school_id}/analytics/metrics",
    createPath: "/schools/{school_id}/analytics/metrics",
    deletePath: "/analytics/metrics/{id}",
    template: { metric_key: "", metric_value: 0, captured_at: "" },
    required: ["metric_key", "metric_value"],
  },
];

export const MODULES = RAW_MODULES.map((m) => ({
  ...m,
  fields: buildFields(m.template, m.overrides || {}, m.required || []),
}));

export const FREE_MODULE_SLUGS = [
  "admissions",
  "classrooms",
  "students",
  "teachers",
  "attendance",
  "exams",
  "timetable",
];

const PREMIUM_EXEMPT_ROLES = ["superadmin", "admin", "school"];

export const ROLE_ACCESS = {
  superadmin: { read: "*", write: "*" },
  admin: { read: "*", write: "*" },
  school: { read: "*", write: "*" },
  teacher: {
    read: ["classrooms", "students", "teachers", "attendance", "exams", "exam-results", "timetable", "announcements", "messages"],
    write: ["attendance", "exams", "exam-results", "timetable", "announcements", "messages"],
  },
  student: {
    read: ["attendance", "fee-invoices", "fee-payments", "exams", "exam-results", "timetable", "announcements", "messages", "classrooms"],
    write: ["messages"],
  },
  parent: {
    read: ["attendance", "fee-invoices", "fee-payments", "exams", "exam-results", "timetable", "announcements", "messages", "classrooms"],
    write: ["messages"],
  },
  accountant: {
    read: ["fee-invoices", "fee-payments", "hr-employees", "hr-payroll", "hr-leaves", "announcements", "messages"],
    write: ["fee-invoices", "fee-payments", "hr-payroll", "messages"],
  },
  librarian: {
    read: ["library-books", "library-issues", "announcements", "messages"],
    write: ["library-books", "library-issues", "messages"],
  },
};

function hasAccess(role, slug, mode) {
  const policy = ROLE_ACCESS[role];
  if (!policy) return false;
  if (!PREMIUM_EXEMPT_ROLES.includes(role) && !FREE_MODULE_SLUGS.includes(slug)) {
    return false;
  }
  if (policy[mode] === "*") return true;
  return Array.isArray(policy[mode]) && policy[mode].includes(slug);
}

export function canReadModule(role, slug) {
  return hasAccess(role, slug, "read");
}

export function canWriteModule(role, slug) {
  return hasAccess(role, slug, "write");
}

export function getModuleBySlug(slug) {
  return MODULES.find((m) => m.slug === slug) || null;
}

export function isPremiumModule(slug) {
  return !FREE_MODULE_SLUGS.includes(slug);
}
