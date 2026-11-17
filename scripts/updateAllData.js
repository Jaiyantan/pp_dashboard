import fs from 'fs';

const raw = JSON.parse(fs.readFileSync('src/data/primeStudentsList.json', 'utf-8'));

function formatName(name) {
  return name.trim().split(/\s+/).map(part => {
    if (part.includes('.')) {
      return part.split('.').map(sub => sub ? sub.charAt(0).toUpperCase() + sub.slice(1).toLowerCase() : '').join('.');
    }
    return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
  }).join(' ');
}

const cleanedStudents = raw.map(s => ({
  ...s,
  name: formatName(s.name)
}));

const HASH_PRIME123 = '0015339fcd0f6ff3a2144b33a7f94700e2f62f8cd6ec001cf1f7a39b08772fa9';
const HASH_FACULTY = '8634fdb56bedafe3bf9dac79ea1f69836cb0418c31526ec02d0c78dd6a4a1af0';

// Faculty Admins
const adminsArray = [
  {
    id: 'admin-karthika',
    email: 'karthika.rn@saveetha.ac.in',
    name: 'Dr. Karthika RN',
    role: 'admin',
    designation: 'Faculty Incharge — Prime Projects',
    department: 'Computer Science & Engineering',
    roll_no: 'FAC-CSE-001',
    faculty_id: 'FAC-CSE-001',
  },
  {
    id: 'admin-rajesh',
    email: 'rajesh.director@saveetha.ac.in',
    name: 'Dr. Rajesh',
    role: 'admin',
    designation: 'Director',
    department: 'Administration',
    roll_no: 'FAC-DIR-001',
    faculty_id: 'FAC-DIR-001',
  },
  {
    id: 'admin-karthi',
    email: 'karthi.govindaraju@saveetha.ac.in',
    name: 'Dr. Karthi Govindaraju',
    role: 'admin',
    designation: 'Head of the Department (HOD)',
    department: 'Computer Science & Engineering',
    roll_no: 'FAC-HOD-001',
    faculty_id: 'FAC-HOD-001',
  },
];

// Students
const studentsArray = cleanedStudents.map(s => ({
  id: s.id,
  email: s.email,
  name: s.name,
  role: 'student',
  designation: 'Prime Project Scholar',
  roll_no: s.regNo,
  department: s.department,
  year: s.year
}));

// Whitelist
const whitelistArray = [
  {
    id: 'wl-1',
    email: 'karthika.rn@saveetha.ac.in',
    name: 'Dr. Karthika RN',
    role: 'admin',
    designation: 'Faculty Incharge — Prime Projects',
    department: 'CSE',
    roll_no: 'FAC-CSE-001',
    added_by: 'System Administrator',
    created_at: '2026-01-10T09:00:00Z',
  },
  {
    id: 'wl-2',
    email: 'rajesh.director@saveetha.ac.in',
    name: 'Dr. Rajesh',
    role: 'admin',
    designation: 'Director',
    department: 'Executive Administration',
    roll_no: 'FAC-DIR-001',
    added_by: 'System Administrator',
    created_at: '2026-01-10T09:00:00Z',
  },
  {
    id: 'wl-3',
    email: 'karthi.govindaraju@saveetha.ac.in',
    name: 'Dr. Karthi Govindaraju',
    role: 'admin',
    designation: 'Head of the Department (HOD)',
    department: 'CSE',
    roll_no: 'FAC-HOD-001',
    added_by: 'System Administrator',
    created_at: '2026-01-10T09:00:00Z',
  },
  ...cleanedStudents.map((s, idx) => ({
    id: `wl-student-${s.regNo}`,
    email: s.email,
    name: s.name,
    role: 'student',
    designation: 'Prime Scholar',
    department: s.department,
    roll_no: s.regNo,
    added_by: idx % 2 === 0 ? 'Dr. Karthika RN' : 'Dr. Karthi Govindaraju',
    created_at: '2026-01-15T10:00:00Z',
  }))
];

// Initial Credentials
const credentialsArray = [
  {
    id: 'cred-karthika',
    reg_no: 'FAC-CSE-001',
    email: 'karthika.rn@saveetha.ac.in',
    password_hash: HASH_FACULTY,
    user_id: 'admin-karthika',
    role: 'admin',
    is_registered: true,
    registered_at: '2026-01-10T09:00:00Z',
  },
  {
    id: 'cred-rajesh',
    reg_no: 'FAC-DIR-001',
    email: 'rajesh.director@saveetha.ac.in',
    password_hash: HASH_FACULTY,
    user_id: 'admin-rajesh',
    role: 'admin',
    is_registered: true,
    registered_at: '2026-01-10T09:00:00Z',
  },
  {
    id: 'cred-karthi',
    reg_no: 'FAC-HOD-001',
    email: 'karthi.govindaraju@saveetha.ac.in',
    password_hash: HASH_FACULTY,
    user_id: 'admin-karthi',
    role: 'admin',
    is_registered: true,
    registered_at: '2026-01-10T09:00:00Z',
  },
  ...cleanedStudents.map(s => ({
    id: `cred-${s.regNo}`,
    reg_no: s.regNo,
    email: s.email,
    password_hash: HASH_PRIME123,
    user_id: s.id,
    role: 'student',
    is_registered: true,
    registered_at: '2026-01-15T10:00:00Z',
  }))
];

// Sample milestones for Prime students across the 5 tracks
const sampleCards = [
  {
    id: 'card-1',
    student_id: 'sec-212224040269',
    student_name: 'A. Ranen Joseph Solomon',
    student_email: '212224040269@saveetha.ac.in',
    roll_no: '212224040269',
    department: 'CSE',
    category: 'competition',
    title: 'TCS CodeVita Season 14 - Global Coding Contest',
    organization_or_event: 'Tata Consultancy Services',
    status: 'in_progress',
    description: 'Participating in Round 1 algorithmic challenges in dynamic programming and graph theory.',
    metrics_or_outcome: 'TCS ID: DT20246216841 | Score: 320/600',
    proof_link: 'https://campuscommune.tcs.com/en-in/intro/contests/codevita',
    date: '2026-02-18',
    admin_remarks: 'Mentored by Dr. Karthika RN. Approved for fast-track lab preparation.',
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-02-10T12:00:00Z',
  },
  {
    id: 'card-2',
    student_id: 'sec-212223240001',
    student_name: 'Aadithya R',
    student_email: '212223240001@saveetha.ac.in',
    roll_no: '212223240001',
    department: 'CSE',
    category: 'hackathon',
    title: 'Smart India Hackathon (SIH 2026) - AgriTech Innovation',
    organization_or_event: 'AICTE / Ministry of Agriculture',
    status: 'completed',
    description: 'Built an autonomous AI drone soil nutrient mapping system with real-time telemetry dashboard.',
    metrics_or_outcome: '🏆 1st Prize Winner (₹1,00,000 Cash Award)',
    proof_link: 'https://github.com/saveetha-prime/agritech-drone-mapping',
    date: '2026-02-12',
    admin_remarks: 'Superb achievement for Saveetha Prime batch. Recommended for patent filing by Dr. Rajesh.',
    created_at: '2026-01-20T09:00:00Z',
    updated_at: '2026-02-14T11:00:00Z',
  },
  {
    id: 'card-3',
    student_id: 'sec-212224240004',
    student_name: 'Abishek Priyan M',
    student_email: '212224240004@saveetha.ac.in',
    roll_no: '212224240004',
    department: 'CSE',
    category: 'internship',
    title: 'Software Development Engineering (SDE) Intern',
    organization_or_event: 'Zoho Corporation, Chennai Campus',
    status: 'in_progress',
    description: 'Working on low-latency microservices with Java, PostgreSQL, and Redis caching layers.',
    metrics_or_outcome: 'Stipend ₹35,000 / month (6-Month PPO Track)',
    proof_link: 'https://drive.google.com/file/d/zoho_offer_abishek/view',
    date: '2026-01-10',
    admin_remarks: 'On-duty attendance approved by HOD Dr. Karthi Govindaraju.',
    created_at: '2026-01-12T08:00:00Z',
    updated_at: '2026-02-05T14:30:00Z',
  },
  {
    id: 'card-4',
    student_id: 'sec-212223230012',
    student_name: 'Amaljosh Maadhav J',
    student_email: '212223230012@saveetha.ac.in',
    roll_no: '212223230012',
    department: 'CSE (Cyber Security)',
    category: 'project',
    title: 'Prime Autonomous Campus Threat Detection System',
    organization_or_event: 'Saveetha Prime Cyber Defense Lab',
    status: 'review',
    description: 'Real-time SIEM anomaly detection using unsupervised autoencoders on campus network traffic logs.',
    metrics_or_outcome: 'Patent Drafting Stage (CBR Issued)',
    proof_link: 'https://github.com/saveetha-prime/siem-anomaly-detector',
    date: '2026-03-05',
    admin_remarks: 'Under technical review by Dr. Karthika RN for college sponsorship.',
    created_at: '2026-01-25T11:00:00Z',
    updated_at: '2026-02-15T16:00:00Z',
  },
  {
    id: 'card-5',
    student_id: 'sec-212224040020',
    student_name: 'Aman Singh',
    student_email: '212224040020@saveetha.ac.in',
    roll_no: '212224040020',
    department: 'CSE',
    category: 'academic',
    title: 'Semester IV Performance & NPTEL Elite Certification',
    organization_or_event: 'Saveetha Autonomous Examination Cell / NPTEL',
    status: 'completed',
    description: 'Scored 94% in NPTEL Cloud Computing & Distributed Systems with Elite+Gold medal.',
    metrics_or_outcome: 'CGPA: 9.28 | NPTEL Elite+Gold',
    proof_link: 'https://nptel.ac.in/noc/certificates/noc25-cs112',
    date: '2025-12-28',
    admin_remarks: 'Academic incentive approved by Director Dr. Rajesh.',
    created_at: '2026-01-05T09:00:00Z',
    updated_at: '2026-01-06T10:00:00Z',
  },
  {
    id: 'card-6',
    student_id: 'sec-212223110003',
    student_name: 'Anbuselvan S',
    student_email: '212223110003@saveetha.ac.in',
    roll_no: '212223110003',
    department: 'IT',
    category: 'competition',
    title: 'IEEE International Conference on Smart Computing (ICSC)',
    organization_or_event: 'IEEE Computer Society',
    status: 'review',
    description: 'Research paper on "Edge LLM Quantization for Assistive Healthcare Devices".',
    metrics_or_outcome: 'Accepted for Oral Presentation (Scopus Indexed)',
    proof_link: 'https://ieee-icsc2026.org/papers/sec-anbu',
    date: '2026-03-25',
    admin_remarks: 'Conference registration fee reimbursed by Saveetha Research Fund.',
    created_at: '2026-02-01T14:00:00Z',
    updated_at: '2026-02-12T15:00:00Z',
  },
  {
    id: 'card-7',
    student_id: 'sec-212225240016',
    student_name: 'Athreya A',
    student_email: '212225240016@saveetha.ac.in',
    roll_no: '212225240016',
    department: 'CSE',
    category: 'hackathon',
    title: 'SEC Intra-College Hackathon (Prime Edition)',
    organization_or_event: 'Saveetha Innovation Council',
    status: 'completed',
    description: 'AI-driven dynamic bus route scheduling algorithm reducing transit delays by 28%.',
    metrics_or_outcome: '🥇 1st Prize (₹25,000 + Incubation Support)',
    proof_link: 'https://github.com/saveetha-prime/transit-ai',
    date: '2026-02-02',
    admin_remarks: 'Selected for deployment in SEC campus transport department.',
    created_at: '2026-02-03T10:00:00Z',
    updated_at: '2026-02-04T12:00:00Z',
  },
  {
    id: 'card-8',
    student_id: 'sec-212224100013',
    student_name: 'Dhruv D',
    student_email: '212224100013@saveetha.ac.in',
    roll_no: '212224100013',
    department: 'AI & DS',
    category: 'competition',
    title: 'TCS CodeVita Season 14 - Preliminary Round',
    organization_or_event: 'Tata Consultancy Services',
    status: 'in_progress',
    description: 'Active participant in competitive programming sprint (TCS ID: DT20257420209).',
    metrics_or_outcome: 'TCS ID: DT20257420209 | Top 5% College Rank',
    proof_link: '',
    date: '2026-02-25',
    admin_remarks: 'Access granted to high-performance coding lab.',
    created_at: '2026-02-08T11:00:00Z',
    updated_at: '2026-02-14T09:30:00Z',
  },
  {
    id: 'card-9',
    student_id: 'sec-212223100006',
    student_name: 'Durgadevi P',
    student_email: '212223100006@saveetha.ac.in',
    roll_no: '212223100006',
    department: 'AI & DS',
    category: 'internship',
    title: 'AI/ML Research Intern',
    organization_or_event: 'IIT Madras Research Park / AgHub',
    status: 'completed',
    description: 'Developed computer vision models for multi-crop pest identification using YOLOv10.',
    metrics_or_outcome: 'Stipend ₹30,000 / month | Certificate of Commendation',
    proof_link: 'https://drive.google.com/file/d/iitm_durga_intern/view',
    date: '2026-01-30',
    admin_remarks: 'Commended by HOD Dr. Karthi Govindaraju for excellent research work.',
    created_at: '2026-01-31T10:00:00Z',
    updated_at: '2026-02-02T16:00:00Z',
  },
  {
    id: 'card-10',
    student_id: 'sec-212224100021',
    student_name: 'Jaiyantan S',
    student_email: '212224100021@saveetha.ac.in',
    roll_no: '212224100021',
    department: 'AI & DS',
    category: 'project',
    title: 'Autonomous Library Book Inventory Bot (ROS2)',
    organization_or_event: 'Saveetha Central Library Automation',
    status: 'planned',
    description: 'RFID-based autonomous mobile robot navigation for automated book stock verification.',
    metrics_or_outcome: 'Hardware BoM Approved (₹45,000 grant)',
    proof_link: '',
    date: '2026-03-30',
    admin_remarks: 'Project approved by Director Dr. Rajesh for library pilot test.',
    created_at: '2026-02-10T12:00:00Z',
    updated_at: '2026-02-10T12:00:00Z',
  }
];

// Write updated mockData.ts
const mockDataContent = `import type { UserProfile, StudentCard, WhitelistUser, AuthCredential } from '../types';

export const INITIAL_ADMINS: UserProfile[] = ${JSON.stringify(adminsArray, null, 2)};

export const INITIAL_STUDENTS: UserProfile[] = ${JSON.stringify(studentsArray, null, 2)};

export const INITIAL_WHITELIST: WhitelistUser[] = ${JSON.stringify(whitelistArray, null, 2)};

export const INITIAL_CREDENTIALS: AuthCredential[] = ${JSON.stringify(credentialsArray, null, 2)};

export const INITIAL_CARDS: StudentCard[] = ${JSON.stringify(sampleCards, null, 2)};
`;

fs.writeFileSync('src/data/mockData.ts', mockDataContent);
console.log('Updated src/data/mockData.ts with credentials, faculty IDs, and 81 students');

// Generate Supabase schema with user_credentials table
let sqlCredentialsTable = `
-- 4. Create User Credentials Table for Authentication
CREATE TABLE IF NOT EXISTS public.user_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reg_no TEXT UNIQUE NOT NULL, -- Register number (Students) or Faculty ID (Faculty)
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'student')),
    is_registered BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can authenticate against credentials"
ON public.user_credentials
FOR SELECT
USING (true);

CREATE POLICY "Users can register their credentials"
ON public.user_credentials
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their password"
ON public.user_credentials
FOR UPDATE
USING (LOWER(email) = LOWER(auth.jwt()->>'email') OR reg_no = current_setting('request.jwt.claim.reg_no', true));
`;

// Update supabase_schema.sql
let schemaContent = fs.readFileSync('supabase_schema.sql', 'utf-8');
if (!schemaContent.includes('public.user_credentials')) {
  // Insert before RLS policies
  schemaContent = schemaContent.replace(
    '-- 3. Create Student Cards Table',
    sqlCredentialsTable + '\n-- 3. Create Student Cards Table'
  );
}

fs.writeFileSync('supabase_schema.sql', schemaContent);
console.log('Updated supabase_schema.sql with user_credentials table');
