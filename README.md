# MDGroup Clinical Trial Management System (CTMS)

A full-stack enterprise CRUD application built for **MDGroup** — a clinical trial coordination company that bridges pharmaceutical sponsors and trial participants across the globe.

---

## What is MDGroup?

MDGroup handles the administrative, logistical, and communication work behind clinical trials. They sit between:

- **Pharmaceutical companies** (Pfizer, Novartis) who fund the trials
- **Research sites** (hospitals in Boston, London, Berlin) where trials run
- **Participants** (patients) who are enrolled in the trials

Their services include patient travel, home visits, stipend payments, 24/7 patient navigation, clinical equipment logistics, and safety reporting.

This system digitizes and manages all of that.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Node.js · TypeScript · Express |
| **Database** | PostgreSQL · Prisma ORM v7 |
| **Auth** | JWT · bcrypt · Role-based access control |
| **API Docs** | Swagger / OpenAPI 3.0 |
| **Frontend** | React · TypeScript · Vite |
| **Styling** | Tailwind CSS v4 |
| **Data Fetching** | TanStack Query · Axios |
| **Containerization** | Docker (PostgreSQL) |

---

## Project Structure

```
CRUD_PROJECT/
├── mdgroup-ctms/          # Backend API
│   ├── prisma/
│   │   ├── schema.prisma  # 13 database models, 14 enums
│   │   └── seed.ts        # Realistic sample data
│   ├── src/
│   │   ├── config/        # Env, Prisma client, Swagger
│   │   ├── controllers/   # Business logic (12 controllers)
│   │   ├── middleware/     # JWT auth, error handling, validation
│   │   ├── routes/        # Express route definitions
│   │   └── index.ts       # App entry point
│   └── PROMPT_LOG.md      # Prompt engineering documentation
│
└── mdgroup-frontend/      # React Frontend
    └── src/
        ├── api/           # Axios client + endpoint functions
        ├── components/    # Reusable UI components
        ├── context/       # Auth context
        ├── pages/         # 12 application pages
        └── App.tsx        # Routes
```

---

## Database — 13 Entities

```
Sponsor ──< Study ──< Enrollment >── Participant
                │          │
               Site      Visit ──< TravelArrangement
                           │
                           ├──< HCPAssignment >── User
                           └──< EquipmentRequest

Participant ──< Payment
Participant ──< Message >── User (Navigator)
Participant ──< AdverseEvent
```

| Entity | Description |
|---|---|
| `User` | System operators — admins, coordinators, navigators, HCPs |
| `Sponsor` | Pharmaceutical companies (Pfizer, Novartis) |
| `Study` | Clinical trials (Phase 1–4) |
| `Site` | Research hospitals and clinics |
| `Participant` | Patients enrolled in trials |
| `Enrollment` | Links a participant to a study at a specific site |
| `Visit` | Appointments — site-based, home visits, telehealth |
| `TravelArrangement` | Flights, taxis, trains arranged for participants |
| `Payment` | Stipends and reimbursements with approval workflow |
| `HCPAssignment` | Healthcare professionals assigned per visit |
| `EquipmentRequest` | Lab kits, ECG machines dispatched to home visits |
| `Message` | 1-on-1 communication between patients and navigators |
| `AdverseEvent` | Safety incidents reported during trials |

---

## API — 57 Endpoints

All endpoints documented at **`http://localhost:3000/api-docs`**

| Resource | Base Path | Operations |
|---|---|---|
| Auth | `/api/auth` | Register, Login, Me |
| Sponsors | `/api/sponsors` | Full CRUD + search |
| Studies | `/api/studies` | Full CRUD + filter by phase/status |
| Sites | `/api/sites` | Full CRUD + study association |
| Participants | `/api/participants` | Full CRUD + search |
| Enrollments | `/api/enrollments` | Full CRUD + status lifecycle |
| Visits | `/api/visits` | Full CRUD + type/status filter |
| Travel | `/api/travel` | Full CRUD |
| Payments | `/api/payments` | Full CRUD + approve/reject workflow |
| Equipment | `/api/equipment` | Full CRUD + dispatch tracking |
| Messages | `/api/messages` | Send + bulk mark-as-read |
| Adverse Events | `/api/adverse-events` | Full CRUD + severity filter |

---

## Frontend — 12 Pages

| Page | Path | Description |
|---|---|---|
| Login | `/login` | JWT authentication |
| Dashboard | `/` | KPI cards, recent studies, upcoming visits |
| Studies | `/studies` | Search and filter clinical trials |
| Study Detail | `/studies/:id` | Full trial info + enrollment list |
| Sponsors | `/sponsors` | Pharma company directory |
| Sites | `/sites` | Global research site network |
| Participants | `/participants` | Patient records with search |
| Participant Detail | `/participants/:id` | Full profile + enrollment history |
| Visits | `/visits` | All visits filtered by type and status |
| Payments | `/payments` | Approve/reject pending reimbursements |
| Messages | `/messages` | Patient-navigator communication inbox |
| Adverse Events | `/adverse-events` | Safety incident tracker |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Docker Desktop

### 1. Clone the repo

```bash
git clone https://github.com/mohamedbokhamy22-a11y/mdgroup-ctms.git
cd mdgroup-ctms
```

### 2. Start the database

```bash
docker run --name mdgroup-pg \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=mdgroup_ctms \
  -p 5432:5432 -d postgres:16
```

### 3. Run the backend

```bash
cd mdgroup-ctms
npm install
npx prisma generate
npx prisma db push
npm run db:seed    # loads sample data
npm run dev        # starts on http://localhost:3000
```

### 4. Run the frontend

```bash
cd ../mdgroup-frontend
npm install
npm run dev        # starts on http://localhost:5173
```

### 5. Open the app

| URL | What's there |
|---|---|
| `http://localhost:5173` | Frontend app |
| `http://localhost:3000/api-docs` | Swagger API docs |
| `http://localhost:3000/health` | Health check |

---

## Demo Credentials

```
Email:    admin@mdgroup.com
Password: Password123!
```

Other accounts available: `james.chen@mdgroup.com`, `priya.sharma@mdgroup.com` (all use `Password123!`)

---

## Sample Data Included

The seed script loads realistic data based on MDGroup's actual business:

- **2 sponsors** — Pfizer Inc., Novartis AG
- **3 studies** — Phase 1 Alzheimer's, Phase 2 Cardiology, Phase 3 Oncology
- **4 sites** — Boston, New York, London, Berlin
- **10 participants** — diverse nationalities and languages
- **5 enrollments** — active, screening, and withdrawn statuses
- **6 visits** — completed and upcoming
- **5 payments** — in various approval states
- **4 messages** — patient-navigator conversations
- **3 adverse events** — mild to moderate severity

---

## Key Engineering Decisions

- **Soft deletes** on core entities (Users, Sponsors, Studies, Sites, Participants) — data is never permanently lost
- **Prisma 7** requires `prisma.config.ts` for database URL (no longer in schema.prisma)
- **Payment approval workflow** — PENDING → APPROVED → PROCESSING → PAID, only deletable when PENDING
- **Visit "delete"** = status set to CANCELLED (preserves audit trail for regulatory compliance)
- **Adverse events** track `reportedToSponsor` flag — required under ICH E6 GCP guidelines

---

## Prompt Engineering Log

Every component in this project was built with a documented prompt. See [`mdgroup-ctms/PROMPT_LOG.md`](./mdgroup-ctms/PROMPT_LOG.md) for the full breakdown of what prompt was used to build each file and why each decision was made.

---

## Phase 2 — Coming Next

- [ ] Real-time messaging with WebSockets
- [ ] Background jobs for payment processing
- [ ] Role-based UI (navigator view vs admin view)
- [ ] Email notifications for adverse events
- [ ] CSV export for regulatory submissions
- [ ] Deployment to AWS / Railway
