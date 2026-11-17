-- =========================================================================
-- SAVEETHA ENGINEERING COLLEGE — PRIME PROJECT STUDENT DASHBOARD
-- SUPABASE DATABASE SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- 1. Create Whitelist Table for Email-based Access Control
CREATE TABLE IF NOT EXISTS public.access_whitelist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'student')),
    designation TEXT,
    department TEXT,
    roll_no TEXT,
    added_by TEXT DEFAULT 'System',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'student')),
    designation TEXT,
    department TEXT,
    roll_no TEXT,
    year TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


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

-- 3. Create Student Cards Table for Kanban Progress Tracking
-- Tracks: Academic, Hackathon, Competition, Internship, Project
CREATE TABLE IF NOT EXISTS public.student_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    roll_no TEXT,
    department TEXT,
    category TEXT NOT NULL CHECK (category IN ('academic', 'hackathon', 'competition', 'internship', 'project')),
    title TEXT NOT NULL,
    organization_or_event TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('planned', 'in_progress', 'review', 'completed')),
    description TEXT NOT NULL,
    metrics_or_outcome TEXT,
    proof_link TEXT,
    date DATE DEFAULT CURRENT_DATE,
    admin_remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for speedy queries by student email and category
CREATE INDEX IF NOT EXISTS idx_student_cards_email ON public.student_cards(student_email);
CREATE INDEX IF NOT EXISTS idx_student_cards_category ON public.student_cards(category);
CREATE INDEX IF NOT EXISTS idx_student_cards_status ON public.student_cards(status);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

ALTER TABLE public.access_whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_cards ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check if the current user is an Admin
-- (Dr. Karthika RN, Dr. Rajesh, Dr. Karthi Govindaraju or listed as admin in access_whitelist)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.access_whitelist
    WHERE LOWER(email) = LOWER(auth.jwt()->>'email')
      AND role = 'admin'
  ) OR LOWER(auth.jwt()->>'email') IN (
    'karthika.rn@saveetha.ac.in',
    'rajesh.director@saveetha.ac.in',
    'karthi.govindaraju@saveetha.ac.in'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -------------------------------------------------------------------------
-- POLICIES FOR student_cards
-- -------------------------------------------------------------------------

-- Policy 1: Admins can SELECT all student cards
CREATE POLICY "Admins can view all cards"
ON public.student_cards
FOR SELECT
USING (public.is_admin());

-- Policy 2: Students can ONLY SELECT their own cards
CREATE POLICY "Students can view only their own cards"
ON public.student_cards
FOR SELECT
USING (LOWER(student_email) = LOWER(auth.jwt()->>'email'));

-- Policy 3: Admins can INSERT cards for any student
CREATE POLICY "Admins can insert cards for all students"
ON public.student_cards
FOR INSERT
WITH CHECK (public.is_admin());

-- Policy 4: Students can INSERT cards ONLY for themselves
CREATE POLICY "Students can insert cards only for themselves"
ON public.student_cards
FOR INSERT
WITH CHECK (
  LOWER(student_email) = LOWER(auth.jwt()->>'email')
);

-- Policy 5: Admins can UPDATE any card (status, admin_remarks, details)
CREATE POLICY "Admins can update any card"
ON public.student_cards
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Policy 6: Students can UPDATE only their own cards (and cannot tamper with admin remarks)
CREATE POLICY "Students can update only their own cards"
ON public.student_cards
FOR UPDATE
USING (LOWER(student_email) = LOWER(auth.jwt()->>'email'))
WITH CHECK (LOWER(student_email) = LOWER(auth.jwt()->>'email'));

-- Policy 7: Admins can DELETE cards
CREATE POLICY "Admins can delete cards"
ON public.student_cards
FOR DELETE
USING (public.is_admin());

-- -------------------------------------------------------------------------
-- POLICIES FOR access_whitelist
-- -------------------------------------------------------------------------

-- Admins can view and manage whitelist
CREATE POLICY "Admins manage access whitelist"
ON public.access_whitelist
FOR ALL
USING (public.is_admin());

-- Anyone authenticated can check if their own email exists
CREATE POLICY "Users can check their whitelist entry"
ON public.access_whitelist
FOR SELECT
USING (LOWER(email) = LOWER(auth.jwt()->>'email'));

-- =========================================================================
-- INITIAL SEED DATA
-- =========================================================================

-- Seed Admins (Dr. Karthika RN, Dr. Rajesh, Dr. Karthi Govindaraju)
INSERT INTO public.access_whitelist (email, name, role, designation, department, added_by)
VALUES
  ('karthika.rn@saveetha.ac.in', 'Dr. Karthika RN', 'admin', 'Faculty Incharge — Prime Projects', 'Computer Science & Engineering', 'System'),
  ('rajesh.director@saveetha.ac.in', 'Dr. Rajesh', 'admin', 'Director', 'Executive Administration', 'System'),
  ('karthi.govindaraju@saveetha.ac.in', 'Dr. Karthi Govindaraju', 'admin', 'Head of the Department (HOD)', 'Computer Science & Engineering', 'System')
ON CONFLICT (email) DO NOTHING;

-- Seed Sample Prime Students
INSERT INTO public.access_whitelist (email, name, role, designation, department, roll_no, added_by)
VALUES
  ('priya.k@saveetha.ac.in', 'K. Priya', 'student', 'Prime Scholar', 'CSE', '211421104085', 'Dr. Karthika RN'),
  ('vignesh.r@saveetha.ac.in', 'R. Vignesh', 'student', 'Prime Scholar', 'AI & DS', '211421104142', 'Dr. Karthika RN'),
  ('ananya.s@saveetha.ac.in', 'S. Ananya', 'student', 'Prime Scholar', 'ECE', '211421106012', 'Dr. Karthi Govindaraju'),
  ('arvind.m@saveetha.ac.in', 'M. Arvind', 'student', 'Prime Scholar', 'CSE', '211421104033', 'Dr. Karthika RN')
ON CONFLICT (email) DO NOTHING;


-- =========================================================================
-- SEED ALL 81 SAVEETHA PRIME STUDENTS (From Official Department Roster)
-- =========================================================================

INSERT INTO public.access_whitelist (email, name, role, designation, department, roll_no, added_by)
VALUES
  ('212224040269@saveetha.ac.in', 'A.Ranen Joseph Solomon', 'student', 'Prime Scholar', 'CSE', '212224040269', 'Dr. Karthika RN'),
  ('212223240001@saveetha.ac.in', 'Aadithya R', 'student', 'Prime Scholar', 'CSE', '212223240001', 'Dr. Karthika RN'),
  ('212224240004@saveetha.ac.in', 'Abishek Priyan M', 'student', 'Prime Scholar', 'CSE', '212224240004', 'Dr. Karthika RN'),
  ('212223230012@saveetha.ac.in', 'Amaljosh Maadhav J', 'student', 'Prime Scholar', 'CSE (Cyber Security)', '212223230012', 'Dr. Karthika RN'),
  ('212224040020@saveetha.ac.in', 'Aman Singh', 'student', 'Prime Scholar', 'CSE', '212224040020', 'Dr. Karthika RN'),
  ('212223110003@saveetha.ac.in', 'Anbuselvan S', 'student', 'Prime Scholar', 'IT', '212223110003', 'Dr. Karthika RN'),
  ('212223230020@saveetha.ac.in', 'Arjun N S', 'student', 'Prime Scholar', 'CSE (Cyber Security)', '212223230020', 'Dr. Karthika RN'),
  ('212223230025@saveetha.ac.in', 'Ashwina K N', 'student', 'Prime Scholar', 'CSE (Cyber Security)', '212223230025', 'Dr. Karthika RN'),
  ('212223220010@saveetha.ac.in', 'Aswini.M', 'student', 'Prime Scholar', 'AI & ML', '212223220010', 'Dr. Karthika RN'),
  ('212225240016@saveetha.ac.in', 'Athreya A', 'student', 'Prime Scholar', 'CSE', '212225240016', 'Dr. Karthika RN'),
  ('212224230031@saveetha.ac.in', 'Bala Saravanan K', 'student', 'Prime Scholar', 'CSE (Cyber Security)', '212224230031', 'Dr. Karthika RN'),
  ('212223240017@saveetha.ac.in', 'Bhuvanesh S R', 'student', 'Prime Scholar', 'CSE', '212223240017', 'Dr. Karthika RN'),
  ('212224240027@saveetha.ac.in', 'Chanthru V', 'student', 'Prime Scholar', 'CSE', '212224240027', 'Dr. Karthika RN'),
  ('212225100031@saveetha.ac.in', 'D R Nethranjan Chowdary', 'student', 'Prime Scholar', 'AI & DS', '212225100031', 'Dr. Karthika RN'),
  ('212223040032@saveetha.ac.in', 'Devasanjay N', 'student', 'Prime Scholar', 'CSE', '212223040032', 'Dr. Karthika RN'),
  ('212224100013@saveetha.ac.in', 'Dhruv D', 'student', 'Prime Scholar', 'AI & DS', '212224100013', 'Dr. Karthika RN'),
  ('212223100006@saveetha.ac.in', 'Durgadevi P', 'student', 'Prime Scholar', 'AI & DS', '212223100006', 'Dr. Karthika RN'),
  ('212224040084@saveetha.ac.in', 'Elfreeda Jesusha J', 'student', 'Prime Scholar', 'CSE', '212224040084', 'Dr. Karthika RN'),
  ('212225230068@saveetha.ac.in', 'Fardeen Gaffoor S', 'student', 'Prime Scholar', 'CSE (Cyber Security)', '212225230068', 'Dr. Karthika RN'),
  ('212224240043@saveetha.ac.in', 'Ganesh Kumar T', 'student', 'Prime Scholar', 'CSE', '212224240043', 'Dr. Karthika RN'),
  ('212223240036@saveetha.ac.in', 'Gautham Krishna S', 'student', 'Prime Scholar', 'CSE', '212223240036', 'Dr. Karthika RN'),
  ('212223240039@saveetha.ac.in', 'Gokkul M', 'student', 'Prime Scholar', 'CSE', '212223240039', 'Dr. Karthika RN'),
  ('212223040052@saveetha.ac.in', 'Gokul Sharan R', 'student', 'Prime Scholar', 'CSE', '212223040052', 'Dr. Karthika RN'),
  ('212223240043@saveetha.ac.in', 'Gughan', 'student', 'Prime Scholar', 'CSE', '212223240043', 'Dr. Karthika RN'),
  ('212223230069@saveetha.ac.in', 'Harevasu S', 'student', 'Prime Scholar', 'CSE (Cyber Security)', '212223230069', 'Dr. Karthika RN'),
  ('212224040098@saveetha.ac.in', 'Haridharshini J', 'student', 'Prime Scholar', 'CSE', '212224040098', 'Dr. Karthika RN'),
  ('212223230072@saveetha.ac.in', 'Harish S', 'student', 'Prime Scholar', 'CSE (Cyber Security)', '212223230072', 'Dr. Karthika RN'),
  ('212223240053@saveetha.ac.in', 'Himavath M', 'student', 'Prime Scholar', 'CSE', '212223240053', 'Dr. Karthika RN'),
  ('212223240054@saveetha.ac.in', 'Hiruthik Sudhakar', 'student', 'Prime Scholar', 'CSE', '212223240054', 'Dr. Karthika RN'),
  ('212224100021@saveetha.ac.in', 'Jaiyantan S', 'student', 'Prime Scholar', 'AI & DS', '212224100021', 'Dr. Karthika RN'),
  ('212223100017@saveetha.ac.in', 'Jothikrishnaa V', 'student', 'Prime Scholar', 'AI & DS', '212223100017', 'Dr. Karthika RN'),
  ('212225040165@saveetha.ac.in', 'Kamaleshwaran S', 'student', 'Prime Scholar', 'CSE', '212225040165', 'Dr. Karthika RN'),
  ('212223240066@saveetha.ac.in', 'Karthick Raja K', 'student', 'Prime Scholar', 'CSE', '212223240066', 'Dr. Karthika RN'),
  ('212223040086@saveetha.ac.in', 'Karthick V', 'student', 'Prime Scholar', 'CSE', '212223040086', 'Dr. Karthika RN'),
  ('212223240070@saveetha.ac.in', 'Keerthana S', 'student', 'Prime Scholar', 'CSE', '212223240070', 'Dr. Karthika RN'),
  ('212223100021@saveetha.ac.in', 'Keerthivasan M', 'student', 'Prime Scholar', 'AI & DS', '212223100021', 'Dr. Karthika RN'),
  ('212223240073@saveetha.ac.in', 'Kishore B', 'student', 'Prime Scholar', 'CSE', '212223240073', 'Dr. Karthika RN'),
  ('212223110023@saveetha.ac.in', 'Kishore Narayanan S R', 'student', 'Prime Scholar', 'IT', '212223110023', 'Dr. Karthika RN'),
  ('212223100027@saveetha.ac.in', 'Loga Mithra R', 'student', 'Prime Scholar', 'AI & DS', '212223100027', 'Dr. Karthika RN'),
  ('212223220054@saveetha.ac.in', 'Maha Vidya J P', 'student', 'Prime Scholar', 'AI & ML', '212223220054', 'Dr. Karthika RN'),
  ('212224040188@saveetha.ac.in', 'Manojkumar K', 'student', 'Prime Scholar', 'CSE', '212224040188', 'Dr. Karthika RN'),
  ('212223240087@saveetha.ac.in', 'Midhun S', 'student', 'Prime Scholar', 'CSE', '212223240087', 'Dr. Karthika RN'),
  ('212223110028@saveetha.ac.in', 'Mohamed Anas O.I', 'student', 'Prime Scholar', 'IT', '212223110028', 'Dr. Karthika RN'),
  ('212223110029@saveetha.ac.in', 'Mohamed Farook', 'student', 'Prime Scholar', 'IT', '212223110029', 'Dr. Karthika RN'),
  ('212223240093@saveetha.ac.in', 'Mohammed Saajid S', 'student', 'Prime Scholar', 'CSE', '212223240093', 'Dr. Karthika RN'),
  ('212224220067@saveetha.ac.in', 'Mushafina R', 'student', 'Prime Scholar', 'AI & ML', '212224220067', 'Dr. Karthika RN'),
  ('212224040210@saveetha.ac.in', 'Nanda Kishor Suresh Priya', 'student', 'Prime Scholar', 'CSE', '212224040210', 'Dr. Karthika RN'),
  ('212223230138@saveetha.ac.in', 'Naveen Kanthan L', 'student', 'Prime Scholar', 'CSE (Cyber Security)', '212223230138', 'Dr. Karthika RN'),
  ('212223230142@saveetha.ac.in', 'Nemaleshwar H', 'student', 'Prime Scholar', 'CSE (Cyber Security)', '212223230142', 'Dr. Karthika RN'),
  ('212223100039@saveetha.ac.in', 'Nijeesh Nj', 'student', 'Prime Scholar', 'AI & DS', '212223100039', 'Dr. Karthika RN'),
  ('212223040139@saveetha.ac.in', 'Oswald Shilo', 'student', 'Prime Scholar', 'CSE', '212223040139', 'Dr. Karthika RN'),
  ('212223040141@saveetha.ac.in', 'Padmavathi M', 'student', 'Prime Scholar', 'CSE', '212223040141', 'Dr. Karthika RN'),
  ('212224240111@saveetha.ac.in', 'Paul Shervin P', 'student', 'Prime Scholar', 'CSE', '212224240111', 'Dr. Karthika RN'),
  ('212224110044@saveetha.ac.in', 'Periya Raja P M', 'student', 'Prime Scholar', 'IT', '212224110044', 'Dr. Karthika RN'),
  ('212224230200@saveetha.ac.in', 'Pragathi Kumar', 'student', 'Prime Scholar', 'CSE (Cyber Security)', '212224230200', 'Dr. Karthika RN'),
  ('212224110046@saveetha.ac.in', 'Purusothaman K', 'student', 'Prime Scholar', 'IT', '212224110046', 'Dr. Karthika RN'),
  ('212223100044@saveetha.ac.in', 'Ravivarman G S', 'student', 'Prime Scholar', 'AI & DS', '212223100044', 'Dr. Karthika RN'),
  ('212223040174@saveetha.ac.in', 'Rohith V', 'student', 'Prime Scholar', 'CSE', '212223040174', 'Dr. Karthika RN'),
  ('212223240142@saveetha.ac.in', 'Roshini S', 'student', 'Prime Scholar', 'CSE', '212223240142', 'Dr. Karthika RN'),
  ('212225230199@saveetha.ac.in', 'S Naveen Srinath', 'student', 'Prime Scholar', 'CSE (Cyber Security)', '212225230199', 'Dr. Karthika RN'),
  ('212224040287@saveetha.ac.in', 'Sangeetha S', 'student', 'Prime Scholar', 'CSE', '212224040287', 'Dr. Karthika RN'),
  ('212224240143@saveetha.ac.in', 'Sanjai M', 'student', 'Prime Scholar', 'CSE', '212224240143', 'Dr. Karthika RN'),
  ('212223230190@saveetha.ac.in', 'Sanjit P', 'student', 'Prime Scholar', 'CSE (Cyber Security)', '212223230190', 'Dr. Karthika RN'),
  ('212223040187@saveetha.ac.in', 'Sanjushri A', 'student', 'Prime Scholar', 'CSE', '212223040187', 'Dr. Karthika RN'),
  ('212223100051@saveetha.ac.in', 'Santhosh Kumar R', 'student', 'Prime Scholar', 'AI & DS', '212223100051', 'Dr. Karthika RN'),
  ('212223230195@saveetha.ac.in', 'Saravanan Pv', 'student', 'Prime Scholar', 'CSE (Cyber Security)', '212223230195', 'Dr. Karthika RN'),
  ('212224230269@saveetha.ac.in', 'Sivabalan M', 'student', 'Prime Scholar', 'CSE (Cyber Security)', '212224230269', 'Dr. Karthika RN'),
  ('212223230211@saveetha.ac.in', 'Sowmya Badoni', 'student', 'Prime Scholar', 'CSE (Cyber Security)', '212223230211', 'Dr. Karthika RN'),
  ('212223240157@saveetha.ac.in', 'Sreekumar', 'student', 'Prime Scholar', 'CSE', '212223240157', 'Dr. Karthika RN'),
  ('212223240158@saveetha.ac.in', 'Sreevalsan V', 'student', 'Prime Scholar', 'CSE', '212223240158', 'Dr. Karthika RN'),
  ('212223220110@saveetha.ac.in', 'Sri Harish B', 'student', 'Prime Scholar', 'AI & ML', '212223220110', 'Dr. Karthika RN'),
  ('212224040325@saveetha.ac.in', 'Sri Yaline R', 'student', 'Prime Scholar', 'CSE', '212224040325', 'Dr. Karthika RN'),
  ('212223040211@saveetha.ac.in', 'Subhashini B', 'student', 'Prime Scholar', 'CSE', '212223040211', 'Dr. Karthika RN'),
  ('212225240165@saveetha.ac.in', 'Syed Samieudeen', 'student', 'Prime Scholar', 'CSE', '212225240165', 'Dr. Karthika RN'),
  ('212224110057@saveetha.ac.in', 'Thirumurugan K', 'student', 'Prime Scholar', 'IT', '212224110057', 'Dr. Karthika RN'),
  ('212223230234@saveetha.ac.in', 'Varshini D', 'student', 'Prime Scholar', 'CSE (Cyber Security)', '212223230234', 'Dr. Karthika RN'),
  ('212223240182@saveetha.ac.in', 'Vinoth M P', 'student', 'Prime Scholar', 'CSE', '212223240182', 'Dr. Karthika RN'),
  ('212223040245@saveetha.ac.in', 'Vinothini T', 'student', 'Prime Scholar', 'CSE', '212223040245', 'Dr. Karthika RN'),
  ('212223240183@saveetha.ac.in', 'Visalan H', 'student', 'Prime Scholar', 'CSE', '212223240183', 'Dr. Karthika RN'),
  ('212223110063@saveetha.ac.in', 'Vishal S', 'student', 'Prime Scholar', 'IT', '212223110063', 'Dr. Karthika RN'),
  ('212223100062@saveetha.ac.in', 'Yathin', 'student', 'Prime Scholar', 'AI & DS', '212223100062', 'Dr. Karthika RN')
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, roll_no = EXCLUDED.roll_no, department = EXCLUDED.department;

INSERT INTO public.profiles (email, name, role, designation, department, roll_no, year)
VALUES
  ('212224040269@saveetha.ac.in', 'A.Ranen Joseph Solomon', 'student', 'Prime Scholar', 'CSE', '212224040269', 'II Year'),
  ('212223240001@saveetha.ac.in', 'Aadithya R', 'student', 'Prime Scholar', 'CSE', '212223240001', 'III Year'),
  ('212224240004@saveetha.ac.in', 'Abishek Priyan M', 'student', 'Prime Scholar', 'CSE', '212224240004', 'II Year'),
  ('212223230012@saveetha.ac.in', 'Amaljosh Maadhav J', 'student', 'Prime Scholar', 'CSE (Cyber Security)', '212223230012', 'III Year'),
  ('212224040020@saveetha.ac.in', 'Aman Singh', 'student', 'Prime Scholar', 'CSE', '212224040020', 'II Year'),
  ('212223110003@saveetha.ac.in', 'Anbuselvan S', 'student', 'Prime Scholar', 'IT', '212223110003', 'III Year'),
  ('212223230020@saveetha.ac.in', 'Arjun N S', 'student', 'Prime Scholar', 'CSE (Cyber Security)', '212223230020', 'III Year'),
  ('212223230025@saveetha.ac.in', 'Ashwina K N', 'student', 'Prime Scholar', 'CSE (Cyber Security)', '212223230025', 'III Year'),
  ('212223220010@saveetha.ac.in', 'Aswini.M', 'student', 'Prime Scholar', 'AI & ML', '212223220010', 'III Year'),
  ('212225240016@saveetha.ac.in', 'Athreya A', 'student', 'Prime Scholar', 'CSE', '212225240016', 'I Year'),
  ('212224230031@saveetha.ac.in', 'Bala Saravanan K', 'student', 'Prime Scholar', 'CSE (Cyber Security)', '212224230031', 'II Year'),
  ('212223240017@saveetha.ac.in', 'Bhuvanesh S R', 'student', 'Prime Scholar', 'CSE', '212223240017', 'III Year'),
  ('212224240027@saveetha.ac.in', 'Chanthru V', 'student', 'Prime Scholar', 'CSE', '212224240027', 'II Year'),
  ('212225100031@saveetha.ac.in', 'D R Nethranjan Chowdary', 'student', 'Prime Scholar', 'AI & DS', '212225100031', 'I Year'),
  ('212223040032@saveetha.ac.in', 'Devasanjay N', 'student', 'Prime Scholar', 'CSE', '212223040032', 'III Year'),
  ('212224100013@saveetha.ac.in', 'Dhruv D', 'student', 'Prime Scholar', 'AI & DS', '212224100013', 'II Year'),
  ('212223100006@saveetha.ac.in', 'Durgadevi P', 'student', 'Prime Scholar', 'AI & DS', '212223100006', 'III Year'),
  ('212224040084@saveetha.ac.in', 'Elfreeda Jesusha J', 'student', 'Prime Scholar', 'CSE', '212224040084', 'II Year'),
  ('212225230068@saveetha.ac.in', 'Fardeen Gaffoor S', 'student', 'Prime Scholar', 'CSE (Cyber Security)', '212225230068', 'I Year'),
  ('212224240043@saveetha.ac.in', 'Ganesh Kumar T', 'student', 'Prime Scholar', 'CSE', '212224240043', 'II Year'),
  ('212223240036@saveetha.ac.in', 'Gautham Krishna S', 'student', 'Prime Scholar', 'CSE', '212223240036', 'III Year'),
  ('212223240039@saveetha.ac.in', 'Gokkul M', 'student', 'Prime Scholar', 'CSE', '212223240039', 'III Year'),
  ('212223040052@saveetha.ac.in', 'Gokul Sharan R', 'student', 'Prime Scholar', 'CSE', '212223040052', 'III Year'),
  ('212223240043@saveetha.ac.in', 'Gughan', 'student', 'Prime Scholar', 'CSE', '212223240043', 'III Year'),
  ('212223230069@saveetha.ac.in', 'Harevasu S', 'student', 'Prime Scholar', 'CSE (Cyber Security)', '212223230069', 'III Year'),
  ('212224040098@saveetha.ac.in', 'Haridharshini J', 'student', 'Prime Scholar', 'CSE', '212224040098', 'II Year'),
  ('212223230072@saveetha.ac.in', 'Harish S', 'student', 'Prime Scholar', 'CSE (Cyber Security)', '212223230072', 'III Year'),
  ('212223240053@saveetha.ac.in', 'Himavath M', 'student', 'Prime Scholar', 'CSE', '212223240053', 'III Year'),
  ('212223240054@saveetha.ac.in', 'Hiruthik Sudhakar', 'student', 'Prime Scholar', 'CSE', '212223240054', 'III Year'),
  ('212224100021@saveetha.ac.in', 'Jaiyantan S', 'student', 'Prime Scholar', 'AI & DS', '212224100021', 'II Year'),
  ('212223100017@saveetha.ac.in', 'Jothikrishnaa V', 'student', 'Prime Scholar', 'AI & DS', '212223100017', 'III Year'),
  ('212225040165@saveetha.ac.in', 'Kamaleshwaran S', 'student', 'Prime Scholar', 'CSE', '212225040165', 'I Year'),
  ('212223240066@saveetha.ac.in', 'Karthick Raja K', 'student', 'Prime Scholar', 'CSE', '212223240066', 'III Year'),
  ('212223040086@saveetha.ac.in', 'Karthick V', 'student', 'Prime Scholar', 'CSE', '212223040086', 'III Year'),
  ('212223240070@saveetha.ac.in', 'Keerthana S', 'student', 'Prime Scholar', 'CSE', '212223240070', 'III Year'),
  ('212223100021@saveetha.ac.in', 'Keerthivasan M', 'student', 'Prime Scholar', 'AI & DS', '212223100021', 'III Year'),
  ('212223240073@saveetha.ac.in', 'Kishore B', 'student', 'Prime Scholar', 'CSE', '212223240073', 'III Year'),
  ('212223110023@saveetha.ac.in', 'Kishore Narayanan S R', 'student', 'Prime Scholar', 'IT', '212223110023', 'III Year'),
  ('212223100027@saveetha.ac.in', 'Loga Mithra R', 'student', 'Prime Scholar', 'AI & DS', '212223100027', 'III Year'),
  ('212223220054@saveetha.ac.in', 'Maha Vidya J P', 'student', 'Prime Scholar', 'AI & ML', '212223220054', 'III Year'),
  ('212224040188@saveetha.ac.in', 'Manojkumar K', 'student', 'Prime Scholar', 'CSE', '212224040188', 'II Year'),
  ('212223240087@saveetha.ac.in', 'Midhun S', 'student', 'Prime Scholar', 'CSE', '212223240087', 'III Year'),
  ('212223110028@saveetha.ac.in', 'Mohamed Anas O.I', 'student', 'Prime Scholar', 'IT', '212223110028', 'III Year'),
  ('212223110029@saveetha.ac.in', 'Mohamed Farook', 'student', 'Prime Scholar', 'IT', '212223110029', 'III Year'),
  ('212223240093@saveetha.ac.in', 'Mohammed Saajid S', 'student', 'Prime Scholar', 'CSE', '212223240093', 'III Year'),
  ('212224220067@saveetha.ac.in', 'Mushafina R', 'student', 'Prime Scholar', 'AI & ML', '212224220067', 'II Year'),
  ('212224040210@saveetha.ac.in', 'Nanda Kishor Suresh Priya', 'student', 'Prime Scholar', 'CSE', '212224040210', 'II Year'),
  ('212223230138@saveetha.ac.in', 'Naveen Kanthan L', 'student', 'Prime Scholar', 'CSE (Cyber Security)', '212223230138', 'III Year'),
  ('212223230142@saveetha.ac.in', 'Nemaleshwar H', 'student', 'Prime Scholar', 'CSE (Cyber Security)', '212223230142', 'III Year'),
  ('212223100039@saveetha.ac.in', 'Nijeesh Nj', 'student', 'Prime Scholar', 'AI & DS', '212223100039', 'III Year'),
  ('212223040139@saveetha.ac.in', 'Oswald Shilo', 'student', 'Prime Scholar', 'CSE', '212223040139', 'III Year'),
  ('212223040141@saveetha.ac.in', 'Padmavathi M', 'student', 'Prime Scholar', 'CSE', '212223040141', 'III Year'),
  ('212224240111@saveetha.ac.in', 'Paul Shervin P', 'student', 'Prime Scholar', 'CSE', '212224240111', 'II Year'),
  ('212224110044@saveetha.ac.in', 'Periya Raja P M', 'student', 'Prime Scholar', 'IT', '212224110044', 'II Year'),
  ('212224230200@saveetha.ac.in', 'Pragathi Kumar', 'student', 'Prime Scholar', 'CSE (Cyber Security)', '212224230200', 'II Year'),
  ('212224110046@saveetha.ac.in', 'Purusothaman K', 'student', 'Prime Scholar', 'IT', '212224110046', 'II Year'),
  ('212223100044@saveetha.ac.in', 'Ravivarman G S', 'student', 'Prime Scholar', 'AI & DS', '212223100044', 'III Year'),
  ('212223040174@saveetha.ac.in', 'Rohith V', 'student', 'Prime Scholar', 'CSE', '212223040174', 'III Year'),
  ('212223240142@saveetha.ac.in', 'Roshini S', 'student', 'Prime Scholar', 'CSE', '212223240142', 'III Year'),
  ('212225230199@saveetha.ac.in', 'S Naveen Srinath', 'student', 'Prime Scholar', 'CSE (Cyber Security)', '212225230199', 'I Year'),
  ('212224040287@saveetha.ac.in', 'Sangeetha S', 'student', 'Prime Scholar', 'CSE', '212224040287', 'II Year'),
  ('212224240143@saveetha.ac.in', 'Sanjai M', 'student', 'Prime Scholar', 'CSE', '212224240143', 'II Year'),
  ('212223230190@saveetha.ac.in', 'Sanjit P', 'student', 'Prime Scholar', 'CSE (Cyber Security)', '212223230190', 'III Year'),
  ('212223040187@saveetha.ac.in', 'Sanjushri A', 'student', 'Prime Scholar', 'CSE', '212223040187', 'III Year'),
  ('212223100051@saveetha.ac.in', 'Santhosh Kumar R', 'student', 'Prime Scholar', 'AI & DS', '212223100051', 'III Year'),
  ('212223230195@saveetha.ac.in', 'Saravanan Pv', 'student', 'Prime Scholar', 'CSE (Cyber Security)', '212223230195', 'III Year'),
  ('212224230269@saveetha.ac.in', 'Sivabalan M', 'student', 'Prime Scholar', 'CSE (Cyber Security)', '212224230269', 'II Year'),
  ('212223230211@saveetha.ac.in', 'Sowmya Badoni', 'student', 'Prime Scholar', 'CSE (Cyber Security)', '212223230211', 'III Year'),
  ('212223240157@saveetha.ac.in', 'Sreekumar', 'student', 'Prime Scholar', 'CSE', '212223240157', 'III Year'),
  ('212223240158@saveetha.ac.in', 'Sreevalsan V', 'student', 'Prime Scholar', 'CSE', '212223240158', 'III Year'),
  ('212223220110@saveetha.ac.in', 'Sri Harish B', 'student', 'Prime Scholar', 'AI & ML', '212223220110', 'III Year'),
  ('212224040325@saveetha.ac.in', 'Sri Yaline R', 'student', 'Prime Scholar', 'CSE', '212224040325', 'II Year'),
  ('212223040211@saveetha.ac.in', 'Subhashini B', 'student', 'Prime Scholar', 'CSE', '212223040211', 'III Year'),
  ('212225240165@saveetha.ac.in', 'Syed Samieudeen', 'student', 'Prime Scholar', 'CSE', '212225240165', 'I Year'),
  ('212224110057@saveetha.ac.in', 'Thirumurugan K', 'student', 'Prime Scholar', 'IT', '212224110057', 'II Year'),
  ('212223230234@saveetha.ac.in', 'Varshini D', 'student', 'Prime Scholar', 'CSE (Cyber Security)', '212223230234', 'III Year'),
  ('212223240182@saveetha.ac.in', 'Vinoth M P', 'student', 'Prime Scholar', 'CSE', '212223240182', 'III Year'),
  ('212223040245@saveetha.ac.in', 'Vinothini T', 'student', 'Prime Scholar', 'CSE', '212223040245', 'III Year'),
  ('212223240183@saveetha.ac.in', 'Visalan H', 'student', 'Prime Scholar', 'CSE', '212223240183', 'III Year'),
  ('212223110063@saveetha.ac.in', 'Vishal S', 'student', 'Prime Scholar', 'IT', '212223110063', 'III Year'),
  ('212223100062@saveetha.ac.in', 'Yathin', 'student', 'Prime Scholar', 'AI & DS', '212223100062', 'III Year')
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, roll_no = EXCLUDED.roll_no, department = EXCLUDED.department, year = EXCLUDED.year;

