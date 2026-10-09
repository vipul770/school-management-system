export const modules = {
  students: { title: 'Students', description: 'Student profiles, enrollment, guardians, and documents.', endpoint: '/students/', fields: [['admission_number','Admission number'],['first_name','First name'],['last_name','Last name'],['email','Email'],['date_of_birth','Date of birth','date'],['guardian_name','Guardian name'],['guardian_phone','Guardian phone']], columns: ['admission_number','first_name','last_name','email','is_active'], resources:[
    {title:'Student profiles',endpoint:'/students/',fields:[['admission_number','Admission number'],['first_name','First name'],['last_name','Last name'],['email','Email'],['date_of_birth','Date of birth','date'],['guardian_name','Guardian name'],['guardian_phone','Guardian phone'],['guardian_user','Parent user ID'],['blood_group','Blood group']],columns:['id','admission_number','first_name','last_name','email','is_active']},
    {title:'Enrollments',endpoint:'/enrollments/',fields:[['student','Student ID'],['class_section','Class ID'],['academic_year','Academic year'],['enrollment_date','Enrollment date','date'],['status','Status']],columns:['student','class_section','academic_year','status']},
    {title:'Documents',endpoint:'/student-documents/',fields:[['student','Student ID'],['doc_type','Document type'],['file','File','file']],columns:['student','doc_type','file','created_at']},
  ] },
  teachers: { title: 'Teachers', description: 'Teacher profiles, subject assignments, and class responsibilities.', endpoint: '/teachers/', fields: [['employee_number','Employee number'],['first_name','First name'],['last_name','Last name'],['email','Email'],['qualification','Qualification'],['joining_date','Joining date','date'],['specialization','Specialization']], columns: ['employee_number','first_name','last_name','email','specialization'],resources:[
    {title:'Teacher profiles',endpoint:'/teachers/',fields:[['employee_number','Employee number'],['first_name','First name'],['last_name','Last name'],['email','Email'],['qualification','Qualification'],['joining_date','Joining date','date'],['specialization','Specialization']],columns:['id','employee_number','first_name','last_name','email','specialization']},
    {title:'Subjects',endpoint:'/subjects/',fields:[['name','Subject'],['code','Subject code'],['class_level','Class level'],['is_elective','Elective (true/false)']],columns:['id','name','code','class_level','is_elective']},
    {title:'Class assignments',endpoint:'/class-assignments/',fields:[['teacher','Teacher ID'],['class_section','Class ID'],['subject','Subject ID'],['academic_year','Academic year']],columns:['id','teacher','class_section','subject','academic_year']},
  ] },
  classes: { title: 'Classes & timetable', description: 'Class sections, subject assignments, and schedules.', endpoint: '/classes/', fields: [['name','Class name'],['grade','Grade'],['section','Section'],['academic_year','Academic year']], columns: ['name','grade','section','academic_year'],resources:[
    {title:'Class sections',endpoint:'/classes/',fields:[['name','Class name'],['grade','Grade'],['section','Section'],['academic_year','Academic year']],columns:['id','name','grade','section','academic_year']},
    {title:'Timetable',endpoint:'/timetable/',fields:[['class_section','Class ID'],['subject','Subject ID'],['teacher','Teacher ID'],['weekday','Weekday (0–6)','number'],['starts_at','Start time','time'],['ends_at','End time','time'],['room','Room']],columns:['class_section','subject','teacher','weekday','starts_at','ends_at','room']},
  ] },
  attendance: { title: 'Attendance', description: 'Open daily attendance sessions and review submitted attendance.', endpoint: '/attendance/sessions/', fields: [['class_section','Class ID'],['date','Date','date'],['status','Status']], columns: ['date','class_section','taken_by','status'],resources:[
    {title:'Daily sessions',endpoint:'/attendance/sessions/',fields:[['class_section','Class ID'],['date','Date','date']],columns:['id','date','class_section','status']},
    {title:'Student records',endpoint:'/attendance/records/',fields:[['session','Session ID'],['student','Student ID'],['status','Status'],['remarks','Remarks']],columns:['id','session','student','status','remarks']},
    {title:'Teacher attendance',endpoint:'/attendance/teacher-records/',fields:[['teacher','Teacher ID'],['date','Date','date'],['check_in','Check in','time'],['check_out','Check out','time'],['status','Status']],columns:['teacher','date','check_in','check_out','status']},
    {title:'Attendance reports',endpoint:'/attendance/reports/',readOnly:true,columns:['total','attendance_rate','counts']},
  ] },
  fees: { title: 'Fees & payments', description: 'Fee structures, student invoices, transactions, and due balances.', endpoint: '/fees/transactions/', fields: [['student','Student ID'],['amount','Amount','number'],['payment_mode','Payment mode'],['transaction_ref','Transaction reference']], columns: ['student','amount','payment_mode','transaction_ref','paid_at'],resources:[
    {title:'Transactions',endpoint:'/fees/transactions/',fields:[['invoice','Invoice ID'],['student','Student ID'],['amount','Amount','number'],['payment_mode','Payment mode'],['transaction_ref','Transaction reference']],columns:['invoice','student','amount','payment_mode','transaction_ref','paid_at']},
    {title:'Fee structures',endpoint:'/fees/structures/',fields:[['name','Structure name'],['class_level','Class level'],['academic_year','Academic year'],['components','Components JSON','json']],columns:['name','class_level','academic_year','components']},
    {title:'Invoices',endpoint:'/fees/invoices/',fields:[['student','Student ID'],['academic_year','Academic year'],['amount','Amount','number'],['due_date','Due date','date'],['status','Status']],columns:['student','academic_year','amount','due_date','status']},
    {title:'Student accounts',endpoint:'/fees/account-ledgers/',fields:[['student','Student ID'],['academic_year','Academic year'],['total_due','Total due','number'],['total_paid','Total paid','number']],columns:['student','academic_year','total_due','total_paid']},
    {title:'Defaulters',endpoint:'/fees/defaulters/',readOnly:true,columns:['student_id','name','academic_year','balance']},
  ] },
  exams: { title: 'Exams & results', description: 'Exam schedules, timetables, grades, and report cards.', endpoint: '/exams/', fields: [['name','Exam name'],['academic_year','Academic year'],['start_date','Start date','date'],['end_date','End date','date']], columns: ['name','academic_year','start_date','end_date'],resources:[
    {title:'Exam schedules',endpoint:'/exams/',fields:[['name','Exam name'],['academic_year','Academic year'],['start_date','Start date','date'],['end_date','End date','date']],columns:['name','academic_year','start_date','end_date']},
    {title:'Timetable',endpoint:'/exam-timetable/',fields:[['exam','Exam ID'],['class_section','Class ID'],['subject','Subject ID'],['date','Date','date'],['start_time','Start time','time'],['end_time','End time','time'],['room','Room']],columns:['exam','class_section','subject','date','start_time','end_time']},
    {title:'Results',endpoint:'/exam-results/',fields:[['exam','Exam ID'],['student','Student ID'],['subject','Subject ID'],['marks_obtained','Marks','number'],['max_marks','Maximum marks','number'],['grade','Grade'],['remarks','Remarks']],columns:['exam','student','subject','marks_obtained','max_marks','grade']},
    {title:'Grading scales',endpoint:'/grading-scales/',fields:[['name','Scale name'],['min_percent','Minimum %','number'],['max_percent','Maximum %','number'],['grade_point','Grade point','number']],columns:['name','min_percent','max_percent','grade_point']},
    {title:'Report cards',endpoint:'/report-cards/',fields:[['student','Student ID'],['exam','Exam ID'],['pdf_url','PDF URL']],columns:['student','exam','generated_at','pdf_url']},
  ] },
  assignments: { title: 'Assignments', description: 'Share homework and follow submissions by class.', endpoint: '/assignments/', fields: [['title','Title'],['description','Instructions','textarea'],['due_at','Due date and time','datetime-local'],['class_section','Class ID']], columns: ['title','class_section','teacher','due_at'],resources:[
    {title:'Homework',endpoint:'/assignments/',fields:[['title','Title'],['description','Instructions','textarea'],['due_at','Due date and time','datetime-local'],['class_section','Class ID'],['teacher','Teacher ID']],columns:['title','class_section','teacher','due_at']},
    {title:'Submissions',endpoint:'/assignment-submissions/',fields:[['assignment','Assignment ID'],['student','Student ID'],['content','Submission','textarea'],['grade','Grade'],['feedback','Feedback','textarea']],columns:['assignment','student','submitted_at','grade','feedback']},
  ] },
  notifications: { title: 'Notifications', description: 'In-app messages, delivery logs, and school notification templates.', endpoint: '/notifications/', fields: [['recipient','Recipient user ID'],['title','Title'],['message','Message','textarea']], columns: ['recipient','title','message','read_at'],resources:[
    {title:'Inbox',endpoint:'/notifications/',fields:[['recipient','Recipient user ID'],['title','Title'],['message','Message','textarea']],columns:['recipient','title','message','read_at']},
    {title:'Templates',endpoint:'/notification-templates/',fields:[['event_type','Event type'],['channel','Channel'],['subject','Subject'],['body','Message template','textarea']],columns:['event_type','channel','subject','body']},
    {title:'Delivery log',endpoint:'/notification-logs/',readOnly:true,columns:['recipient','channel','event_type','status','sent_at']},
  ] },
  reports: { title: 'Reports & analytics', description: 'Queue report generation and view completed exports.', endpoint: '/reports/jobs/', fields: [['report_type','Report type'],['parameters','Parameters (JSON)','json']], columns: ['report_type','status','result_url','created_at'] },
  communications: { title: 'Communications', description: 'School announcements and direct messages for your community.', endpoint: '/communications/announcements/', fields: [['title','Announcement title'],['body','Message','textarea'],['audience','Audience']], columns: ['title','author','audience','published_at'],resources:[
    {title:'Announcements',endpoint:'/communications/announcements/',fields:[['title','Announcement title'],['body','Message','textarea'],['audience','Audience']],columns:['title','author','audience','published_at']},
    {title:'Messages',endpoint:'/communications/messages/',fields:[['recipient','Recipient user ID'],['subject','Subject'],['body','Message','textarea']],columns:['sender','recipient','subject','sent_at']},
  ] },
  settings: { title: 'School settings', description: 'Organization profile, academic year, users, billing, and feature flags.', endpoint: '/schools/', fields: [['name','School name'],['organization_id','Organization ID'],['email','School email'],['phone','Phone'],['timezone','Timezone'],['address','Address','textarea']], columns: ['name','organization_id','email','timezone','is_active'],resources:[
    {title:'School profile',endpoint:'/schools/',isSchool:true,fields:[['name','School name'],['organization_id','Organization ID'],['email','School email'],['phone','Phone'],['timezone','Timezone'],['address','Address','textarea']],columns:['name','organization_id','email','timezone','is_active']},
    {title:'Academic & regional settings',endpoint:'/school-settings/',fields:[['academic_year_start','Academic year begins','date'],['grading_system','Grading system'],['currency','Currency code'],['sms_provider_config','SMS provider configuration JSON','json']],columns:['academic_year_start','grading_system','currency']},
    {title:'Users & roles',endpoint:'/accounts/users/',fields:[['username','Username'],['email','Email'],['first_name','First name'],['last_name','Last name'],['role','Role (school_admin/teacher/student/parent/accountant)'],['password','Temporary password','password']],columns:['username','email','first_name','last_name','role','is_active']},
    {title:'Subscription',endpoint:'/subscriptions/',readOnly:true,columns:['plan','status','start_date','end_date']},
    {title:'Available plans',endpoint:'/subscription-plans/',readOnly:true,columns:['name','price_monthly','max_students','max_teachers','features']},
    {title:'Feature flags',endpoint:'/feature-flags/',fields:[['feature_key','Feature key'],['is_enabled','Enabled (true/false)'],['config','Configuration JSON','json']],columns:['feature_key','is_enabled','config']},
    {title:'Audit log',endpoint:'/audit-logs/',readOnly:true,columns:['created_at','action','model','object_id','actor_id']},
  ] },
  'my-school': {title:'My school',description:'Your classes, attendance, homework, results, and fee information.',endpoint:'/students/',readOnly:true,resources:[
    {title:'My student profile',endpoint:'/students/',readOnly:true,columns:['id','admission_number','first_name','last_name','email']},
    {title:'Attendance',endpoint:'/attendance/records/',readOnly:true,columns:['session','student','status','remarks']},
    {title:'Exam results',endpoint:'/exam-results/',readOnly:true,columns:['exam','subject','marks_obtained','max_marks','grade','remarks']},
    {title:'Fee account',endpoint:'/fees/account-ledgers/',readOnly:true,columns:['student','academic_year','total_due','total_paid']},
    {title:'Homework',endpoint:'/assignments/',readOnly:true,columns:['title','class_section','due_at']},
    {title:'Notifications',endpoint:'/notifications/',readOnly:true,columns:['title','message','read_at']},
  ]},
}

export const navigation = [
  ['dashboard','Overview','/dashboard','all'], ['platform-schools','Schools','/platform/schools','super_admin'], ['platform-users','All users','/platform/users','super_admin'], ['platform-plans','Subscription plans','/platform/plans','super_admin'], ['platform-audit','Audit activity','/platform/audit','super_admin'], ['students','Students','/students','school_admin,teacher'], ['teachers','Teachers','/teachers','school_admin'],
  ['classes','Classes & timetable','/classes','school_admin,teacher'], ['attendance','Attendance','/attendance','school_admin,teacher'], ['fees','Fees & payments','/fees','school_admin,accountant'],
  ['exams','Exams & results','/exams','school_admin,teacher'], ['assignments','Assignments','/assignments','school_admin,teacher'], ['notifications','Notifications','/notifications','school_admin,teacher,student,parent'],
  ['reports','Reports & analytics','/reports','school_admin,accountant'], ['communications','Communications','/communications','school_admin,teacher'], ['users','Users & roles','/users','school_admin'], ['settings','School settings','/settings','school_admin'],
  ['my-school','My school','/my-school','student,parent'],
]
