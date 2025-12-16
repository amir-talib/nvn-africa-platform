# 📘 Product Requirements Document (PRD)

## NVN Africa Platform (NAMYO – Africa Regional Office)

**Mobilizing Africa's Youth for Service, Leadership & Change**

---

## 1. Product Overview

### 1.1 Problem Statement

Africa has the world's largest youth population, yet civic engagement, volunteering, and community development remain fragmented, undocumented, and difficult to verify. NGOs struggle to find committed youth volunteers, and young people lack credible digital records of their service.

### 1.2 Solution

The NVN Africa Platform creates a unified digital ecosystem for youth volunteers across Africa.

It allows volunteers to register, participate, track service hours, gain badges, join leadership initiatives, and collaborate with NGOs.

Admins and Mobilizers can manage projects, verify youth, process requests, and track continent-wide impact.

---

## 2. Objectives & KPIs

### Platform Objectives

- Build the largest verifiable youth volunteer database in Africa.
- Provide transparent project management, from creation → verification → execution.
- Enable youth to accumulate impact hours, ranks, badges, certifications.
- Support NGOs, government ministries, and partner institutions.
- Enable crowdfunding, voting, and leadership participation.

### Primary KPIs

- Number of verified volunteers
- Number of active projects
- Project completion rate
- Total verified volunteer hours
- Partnered NGOs and institutions
- Youth certifications issued
- Leadership election votes cast

---

## 3. User Roles

### 3.1 Volunteer

- Register, login, update profile
- Request to join projects
- Track hours, achievements, badges
- Take micro-learning modules
- Print certificates
- Participate in leadership votes

### 3.2 Mobilizer

- Approve/verify volunteers
- Create/manage projects
- Approve volunteer participation
- Track regional impact

### 3.3 NGO / Partner Organization

- Submit projects
- Request volunteers
- Receive reports on project impact

### 3.4 Admin (Super Admin)

- Full system oversight
- Approve projects
- Manage mobilizers & NGO accounts
- Manage platform-wide data

---

## 4. Core Features & Requirements

Below are the product requirements for each module. Everything listed can be converted directly into backend endpoints.

### 4.1 Authentication & User Profiles

**Requirements:**

- JWT Authentication
- Role-based access control (Volunteer, Mobilizer, NGO, Admin)
- Email + Phone verification
- Profile completion progress bar
- Upload profile picture
- View volunteer stats (hours, badges, rank)

### 4.2 Projects Module

**Features:**

- ✔ Project creation
- ✔ Project update & delete (only by lead)
- ✔ Volunteer request to join project
- ✔ Mobilizer/Admin approval
- ✔ Track number of volunteers
- ✔ Track project status
- ✔ Add project images
- ✔ Complete/Close project

**Project Fields:**

| Field | Description |
|-------|-------------|
| `title` | Project title |
| `description` | Project description |
| `project_lead` | Lead volunteer/mobilizer |
| `status` | upcoming, ongoing, completed, cancelled |
| `location` | Project location |
| `start_date` | Start date |
| `end_date` | End date |
| `requirements` | Project requirements |
| `neededVolunteers` | Number of volunteers needed |
| `joinedVolunteers` | Number of volunteers joined |
| `images` | Project images |
| `created_by` | Creator |
| `edited_by` | Last editor |

### 4.3 Project Request System

**Flow:**

1. Volunteer → "Request to Join Project"
2. System checks:
   - Is project valid?
   - Has user already requested?
3. Request stored in `ProjectRequest` collection
4. Mobilizer/Admin sees pending requests
5. Approve or Reject
6. If approved → volunteer added to project's joined list

**Fields (ProjectRequest):**

| Field | Description |
|-------|-------------|
| `project` | Reference to project |
| `volunteer` | Reference to volunteer |
| `status` | pending, approved, rejected |
| `date_requested` | Request timestamp |

### 4.4 Volunteer Hours Tracking

**Requirements:**

- Hours added when project is completed
- Mobilizer/Admin verifies hours
- Total hours reflected on dashboard
- Hours contribute to ranks + badges

### 4.5 Gamification System

**Badges:**

| Badge | Requirement |
|-------|-------------|
| Bronze | First 10 hours |
| Silver | 50 hours |
| Gold | 100+ hours |
| Community Hero | Top 1% monthly |
| Leadership Badge | Leadership activities |
| Event Participation Badge | Event attendance |

**Ranks:**

| Level | Title |
|-------|-------|
| 1 | Starter |
| 2 | Active Volunteer |
| 3 | Community Leader |
| 4 | Regional Mobilizer |
| 5 | Impact Ambassador |

### 4.6 Voting System (Elections & Project Voting)

**Requirements:**

- Secure, one-vote-per-user system
- Admin creates vote
- Display candidates
- Volunteers vote from dashboard
- Real-time results tracking
- Anti-duplicate hash locking system

### 4.7 Crowdfunding (Phase 2)

**Requirements:**

- Project fundraising page
- Donation history
- External payment gateway integration
- Admin approval for fundraising-enabled projects

### 4.8 Micro-learning Module

**Requirements:**

- Course categories
- Short lessons
- Quiz
- Certificate issuance
- Completion tracking per user

### 4.9 Notifications

**Types:**

- In-app notifications
- Email notifications
- Project updates
- Approvals/Rejections
- Voting reminders

### 4.10 Dashboard & Analytics

**Metrics:**

- Total Volunteers
- Total Hours
- Active Projects
- Projects completed by region
- Gender breakdown
- Age breakdown
- Country comparison

---

## 5. System Architecture

### Backend

- Node.js + Express
- MongoDB (Mongoose)
- JWT Authentication
- Cloudinary for images
- Nodemailer for emails

### Frontend

- Next.js / React
- Tailwind / Chakra UI

### Deployment

- Frontend: Vercel
- Backend: Railway / Render
- DB: MongoDB Atlas

---

## 6. Database Collections Overview

| Collection | Description |
|------------|-------------|
| `Users` | User accounts and profiles |
| `Projects` | Volunteer projects |
| `ProjectRequest` | Join requests |
| `VolunteerHours` | Hours tracking |
| `Badges` | Achievement badges |
| `Courses` | Learning modules |
| `Certificates` | Issued certificates |
| `Notifications` | User notifications |
| `Voting` | Elections and votes |
| `NGOs` | Partner organizations |

---

## 7. Roadmap

### Phase 1 (MVP)

- ✅ Authentication
- ✅ User profiles
- ✅ Project module (create/update/delete)
- ✅ Project request/approval
- ✅ Volunteer hours
- ✅ Dashboard (basic)
- ✅ Notification (basic)

### Phase 2

- 🔄 Badges + Gamification
- 🔄 Voting
- 🔄 Micro-learning
- 🔄 NGO/Partner accounts

### Phase 3

- ⏳ Crowdfunding
- ⏳ Mobile app
- ⏳ Offline volunteer verification QR scanning

---

## 8. Acceptance Criteria

- Projects must require admin/mobilizer approval before becoming public
- Volunteers cannot self-join projects without requesting
- Only project leads/mobilizers can approve requests
- Volunteers can only vote once per election
- All hours must be manually verified by a mobilizer

---

## 9. Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Fake volunteers/hours | Manual verification + Admin oversight |
| Duplicate accounts | Email + phone verification |
| Project fraud | NGO verification + documents upload |
| Server capacity | Scalable infrastructure |

---

## 10. Success Definition

The NVN Africa Platform is considered successful if it becomes the continent's most trusted volunteer verification system, powering:

- **1M+** African youth
- **Thousands** of verified projects
- **Recognized** digital certificates
- **Partnerships** with governments, NGOs, and universities
