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

const cleaned = raw.map(s => ({
  ...s,
  name: formatName(s.name)
}));

const tsContent = `// Saveetha Engineering College — Prime Project Students Directory (81 Students)
import type { UserProfile, WhitelistUser, StudentCard } from '../types';

export interface PrimeStudentMeta {
  sno: string;
  id: string;
  name: string;
  regNo: string;
  email: string;
  codevita: string;
  department: string;
  year: string;
  role: 'student';
  designation: string;
}

export const PRIME_STUDENTS_LIST: PrimeStudentMeta[] = ${JSON.stringify(cleaned, null, 2)};
`;

fs.writeFileSync('src/data/primeStudents.ts', tsContent);
console.log('Successfully written src/data/primeStudents.ts with', cleaned.length, 'students');
