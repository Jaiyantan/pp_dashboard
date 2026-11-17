# Saveetha Engineering College — Prime Project Student Dashboard

A lightweight, minimalistic Kanban-style dashboard for managing **Prime Project** students at Saveetha Engineering College. Designed with a warm whitish-ivory aesthetic (`#FAF8F5`), zero bloat, role-based permissions, and full authentication powered by **Supabase**.

---

## 🔐 Authentication & Access Control

### 1. Student Login
- **Login Identifier**: 12-digit **Register Number** (e.g., `212224040269`).
- **Password**: Secure password set during first-time registration (or default initial demo password: `Prime@123`).
- **Student Privacy & Isolation**: Students can strictly view and manage **only their own** academic, hackathon, competition, internship, and project milestones.

### 2. Faculty Leadership Login
- **Faculty Leaders**:
  - **Dr. Karthika RN** (Faculty Incharge — Prime Projects): Faculty ID `FAC-CSE-001`
  - **Dr. Rajesh** (Director): Faculty ID `FAC-DIR-001`
  - **Dr. Karthi Govindaraju** (HOD — CSE): Faculty ID `FAC-HOD-001`
- **Password**: Secure faculty password (default initial demo password: `Faculty@2026`).
- **Faculty Capabilities**: Full access to view, edit, add milestones, endorse submissions, and add official signed remarks for **all 81 students**, plus manage the email/register number whitelist.

### 3. First-Time User Registration
- Before logging in, first-time students or faculty click the **"First-Time Register"** tab.
- **Whitelist Verification**: The system checks in real-time whether the entered Register Number / Faculty ID is on the approved whitelist created by Dr. Karthika RN, Dr. Rajesh, or Dr. Karthi Govindaraju.
  - If approved: Displays a verified scholar badge, auto-populates their name and institutional email, and prompts them to set a custom password.
  - If not approved: Blocks registration and prompts the user to contact the Prime faculty leaders for whitelist authorization.

---

## ⚡ Quick Test Credentials

| Role | Name | Register Number / ID | Default Password | Permissions |
|---|---|---|---|---|
| **Faculty Incharge** | Dr. Karthika RN | `FAC-CSE-001` | `Faculty@2026` | Full oversight, remarks & whitelist |
| **Director** | Dr. Rajesh | `FAC-DIR-001` | `Faculty@2026` | Executive approvals & review |
| **HOD** | Dr. Karthi Govindaraju | `FAC-HOD-001` | `Faculty@2026` | Department-wide oversight |
| **Student** | A. Ranen Joseph Solomon | `212224040269` | `Prime@123` | Own milestones only |
| **Student** | Aadithya R | `212223240001` | `Prime@123` | Own milestones only |
| **Student** | Any of the 81 Students | *[Any Register No from sheet]* | `Prime@123` | Own milestones only |

*(Note: Users can also click "Sign Out" in the dashboard to test registering as a new first-time user).*

---

## 🌟 5-Track Performance Tracking

1. 🎓 **Academics** (CGPA, NPTEL Elite+Gold Certifications, Semester Milestones)
2. 💻 **Hackathons** (Smart India Hackathon, TN State Police Hackathon, College Hackathons)
3. 🏆 **Competitions** (TCS CodeVita Seasons, IEEE Paper Presentations, Kaggle Challenges)
4. 💼 **Internships** (Zoho Corp, Texas Instruments, IIT Madras Research Park, Stipends)
5. 🚀 **Prime Projects** (Campus AI Systems, Autonomous Drone Fleets, Patents & CBRs)

---

## 🚀 Running the Project

```bash
# In CMD or Git Bash
npm run dev

# In PowerShell (if execution policy applies)
npm.cmd run dev
```

Visit **`http://localhost:5173`** in your browser.
