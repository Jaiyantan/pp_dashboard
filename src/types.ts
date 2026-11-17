export type UserRole = 'admin' | 'student';

export type TrackCategory = 'academic' | 'hackathon' | 'competition' | 'internship' | 'project';

export type CardStatus = 'planned' | 'in_progress' | 'review' | 'completed';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  designation: string; // e.g. "Faculty Incharge", "Director", "HOD", "Prime Student"
  department?: string;
  roll_no?: string;
  faculty_id?: string;
  year?: string;
  avatar_url?: string;
  is_registered?: boolean;
}

export interface StudentCard {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  roll_no?: string;
  department?: string;
  category: TrackCategory;
  title: string;
  organization_or_event: string;
  status: CardStatus;
  description: string;
  metrics_or_outcome?: string; // e.g., "1st Prize - ₹25k", "CGPA 9.2", "Stipend ₹30,000/mo"
  proof_link?: string;
  date: string;
  admin_remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface WhitelistUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  designation: string;
  department: string;
  roll_no?: string;
  added_by: string;
  created_at: string;
}

export interface AuthCredential {
  id: string;
  reg_no: string; // Student Reg No or Faculty ID
  email: string;
  password_hash: string;
  user_id: string;
  role: UserRole;
  is_registered: boolean;
  registered_at?: string;
}

export interface AuthSession {
  user: UserProfile;
  token: string;
  expires_at: number;
}
