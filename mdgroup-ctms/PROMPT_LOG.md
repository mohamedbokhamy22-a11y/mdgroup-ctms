# MDGroup CTMS — Prompt Engineering Log

This document records the exact prompt used to implement each component of the
MDGroup Clinical Trial Management System. It serves as both a development diary
and a template library for future enterprise projects.

---

## 1. Business Discovery

**Component:** Research & domain understanding
**Prompt used:**
> "Research the company MDGroup that operates in the clinical trial space.
> They handle communication between individual participants and pharmaceutical
> companies, managing administrative work, logistics, and communication.
> List all the services and workflows they provide, what are the key processes,
> data entities, and operational flows involved in their clinical trial
> coordination business?"

**What we learned:**
- MDGroup bridges pharma sponsors/CROs and trial participants
- 6 core service lines: Patient Travel, Decentralized Clinical Services,
  Patient Payments, Patient Coordination, Clinical Logistics, HCP Staffing
- Proprietary platform: primarius
- 99% patient satisfaction rate
- Key entity groups: Studies, Sites, Participants, Visits, Travel, Payments,
  HCP Staff, Equipment, Messages, Adverse Events

---

## 2. Database Schema Design

**Component:** `prisma/schema.prisma`
**Prompt used:**
> "Design a PostgreSQL schema for MDGroup's clinical trial coordination platform.
> Entities needed: Users (system operators/navigators), Sponsors (pharma companies),
> Studies (clinical trials), Sites (research sites), Participants (patients),
> Enrollments (patient-study join), Visits (site-based or home), TravelArrangements,
> Payments (stipends/reimbursements), HCPAssignments (healthcare professional
> staffing per visit), EquipmentRequests (logistics), Messages (patient-navigator
> communication), AdverseEvents (safety reporting).
> Use soft deletes, audit timestamps, proper enums for status fields."

**Design decisions:**
- 13 models, 14 enums
- Soft-delete pattern (`deletedAt`) on core entities (Users, Sponsors, Studies, Sites, Participants)
- Hard delete only on operational records (Enrollments, Payments, Travel, Equipment, Messages, AEs)
- Unique constraints prevent duplicate enrollment in same study
- All status fields use database-level enums for data integrity
- Junction table `StudySite` for many-to-many Study ↔ Site
- Audit fields (`createdAt`, `updatedAt`) on every model
- Indexes on all FK columns and frequently filtered fields (status, email, scheduledDate)

---

## 3. Environment Configuration

**Component:** `src/config/env.ts`
**Prompt used:**
> "Create a typed environment config loader for a Node.js app using zod validation.
> Required vars: DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN, PORT, NODE_ENV.
> Exit process with helpful error if any required var is missing."

**Why Zod for env validation:**
- Same validation library used for API input — no extra dependency
- Provides clear error messages at startup before any DB connection
- Coerces PORT to number automatically

---

## 4. Prisma Client Singleton

**Component:** `src/config/prisma.ts`
**Prompt used:**
> "Create a singleton Prisma client for a Node.js app, preventing multiple
> instances during hot reload in development."

**Why this matters:**
- `ts-node-dev` hot-reloads modules but global state persists
- Without the singleton, each reload opens a new DB connection pool
- Pattern uses `globalThis` to survive module cache clearing

---

## 5. JWT Authentication Middleware

**Component:** `src/middleware/auth.ts`
**Prompt used:**
> "Build JWT authentication middleware for Express with role-based access control.
> verifyToken extracts and validates the Bearer token. requireRole is a factory
> that returns middleware enforcing one of the allowed UserRole values."

**Key implementation choices:**
- `verifyToken` returns void and calls `next()` or `sendUnauthorized` — no throw pattern
- `requireRole` is a factory (not a middleware) so it can be composed per-route
- Role check uses `UserRole` enum from Prisma client for type safety
- Both functions handle the `AuthenticatedRequest` type augmentation cleanly

---

## 6. Global Error Handler

**Component:** `src/middleware/errorHandler.ts`
**Prompt used:**
> "Write a global Express error handler that handles Prisma known errors (P2002
> unique constraint, P2025 not found), Zod validation errors, and generic errors.
> Return consistent JSON error envelopes and never leak stack traces in production."

**Prisma error codes handled:**
- `P2002` → HTTP 409 Conflict (duplicate unique field)
- `P2025` → HTTP 404 Not Found (record not found on update/delete)

**Zod error formatting:**
- Flattens `ZodError.issues` into `{ fieldPath: string[] }` map
- Allows frontend to display per-field validation errors

---

## 7. Auth Controller

**Component:** `src/controllers/auth.controller.ts`
**Prompt used:**
> "Build an auth controller for MDGroup CTMS with register and login endpoints.
> Hash passwords with bcrypt, issue JWT tokens on login, return user profile
> without the password hash."

**Security practices:**
- Passwords hashed with bcrypt (configurable rounds via env)
- Login returns identical error for wrong email vs wrong password (no user enumeration)
- Password hash never included in any response shape
- JWT payload contains only `sub`, `email`, `role` — minimal surface area

---

## 8. Sponsor & Study Controllers

**Components:** `sponsor.controller.ts`, `study.controller.ts`
**Prompt used:**
> "Build a CRUD controller for Sponsors (pharmaceutical companies) in the MDGroup CTMS.
> Sponsors can be listed with pagination and search by name/country, fetched by ID,
> created, updated, and soft-deleted. Always filter out soft-deleted records.
> Build a CRUD controller for Studies (clinical trials). Support filtering by
> status, phase, sponsorId. Include sponsor name and enrollment/site counts."

**Patterns established here and used throughout:**
- All list endpoints use `parsePagination()` for consistent page/limit handling
- Soft-delete filter `{ deletedAt: null }` on every read
- `_count` used instead of loading full relation arrays for list views
- Separate `include` shapes for list vs detail views (performance)

---

## 9. Site Controller

**Component:** `src/controllers/site.controller.ts`
**Prompt used:**
> "Build a CRUD controller for Sites (research locations) in the MDGroup CTMS.
> Sites link to Studies via the StudySite join table. Support city/country filtering
> and study association management via addSiteToStudy / removeSiteFromStudy."

**Notable feature:** `addSiteToStudy` / `removeSiteFromStudy` are dedicated endpoints
that manage the M:N relationship without exposing the join table directly to clients.
P2002 caught and mapped to 409 for duplicate links.

---

## 10. Participant Controller

**Component:** `src/controllers/participant.controller.ts`
**Prompt used:**
> "Build a CRUD controller for Participants (patients) in MDGroup CTMS.
> Participants are the patients enrolled in clinical trials. Support search by
> name, country, requiresAssistance flag. Soft-delete pattern. Include enrollment count."

**Privacy note:** Participants have `externalRef` (opaque system ID) rather than
exposing internal IDs to downstream systems. Date of birth stored but never included
in list views — only in detail view.

---

## 11. Enrollment Controller

**Component:** `src/controllers/enrollment.controller.ts`
**Prompt used:**
> "Build a CRUD controller for Enrollments — the join between a Participant and a
> Study at a specific Site. Track status lifecycle from SCREENING through COMPLETED
> or WITHDRAWN. Include participant, study, site details."

**Status lifecycle:** SCREENING → ENROLLED → ACTIVE → COMPLETED | WITHDRAWN | SCREEN_FAILED
Unique constraint on (participantId, studyId) enforced at DB level; P2002 → 409.

---

## 12. Visit Controller

**Component:** `src/controllers/visit.controller.ts`
**Prompt used:**
> "Build a CRUD controller for Visits in MDGroup CTMS. Visits are scheduled
> interactions (site-based or home visits) linked to an Enrollment. Track visit type,
> status, scheduling. Include HCP assignments and equipment requests in detail view."

**Smart behaviors:**
- Auto-sets `completedDate = now()` when status changes to COMPLETED (if not provided)
- Soft-delete via status change to CANCELLED (preserves visit history for audit)
- Date range filtering via `dateFrom`/`dateTo` query params

---

## 13. Payment Controller

**Component:** `src/controllers/payment.controller.ts`
**Prompt used:**
> "Build a CRUD controller for Payments — participant stipends, travel reimbursements,
> and expense claims. Payments have an approval workflow: PENDING → APPROVED →
> PROCESSING → PAID. Track who created and who approved each payment."

**Approval workflow:**
- `createPayment` always creates with status PENDING; `createdById` from JWT
- `approvePayment` is a separate endpoint (PATCH /:id/approve); sets `approvedById`
- Delete only allowed on PENDING payments — prevents deletion of financial records

---

## 14. Travel Arrangement Controller

**Component:** `src/controllers/travel.controller.ts`
**Prompt used:**
> "Build a CRUD controller for TravelArrangements in MDGroup CTMS.
> Each arrangement is linked to a participant and a visit. Track mode of transport,
> origin/destination, booking status, costs."

**Business context:** MDGroup provides compliant travel arrangements for participants —
flights, trains, taxis, ambulances. Both estimated and actual costs tracked for
reconciliation and sponsor billing.

---

## 15. Equipment Request Controller

**Component:** `src/controllers/equipment.controller.ts`
**Prompt used:**
> "Build a CRUD controller for EquipmentRequests in MDGroup CTMS.
> Equipment is requested per visit — EKG machines, lab kits, wearables.
> Track dispatch and delivery status with timestamps."

**Auto-timestamp logic:** When status transitions to DISPATCHED, `dispatchedAt`
is auto-set if not already present (same pattern for DELIVERED → deliveredAt).

---

## 16. Message Controller

**Component:** `src/controllers/message.controller.ts`
**Prompt used:**
> "Build a CRUD controller for Messages in MDGroup CTMS — the communication
> channel between participants and their assigned patient navigators. Support
> threaded inbox view per participant, mark-as-read, and outbound message sending."

**Key design:** `markMessagesRead` uses `updateMany` with `id: { in: [...] }` for
bulk operation — allows UI to mark an entire conversation thread as read in one call.
OUTBOUND messages automatically set `navigatorId` from JWT.

---

## 17. Adverse Event Controller

**Component:** `src/controllers/adverseEvent.controller.ts`
**Prompt used:**
> "Build a CRUD controller for AdverseEvents in MDGroup CTMS — safety events
> reported during a clinical trial. Support severity filtering, sponsor reporting
> flag, and resolution tracking. Critical for regulatory compliance."

**Regulatory importance:** All adverse events are tracked with `reportedToSponsor`
flag. FATAL/LIFE_THREATENING events must be reported to sponsor within 24h under
ICH E6 GCP guidelines. `resolvedAt` auto-set when status → RESOLVED.

---

## 18. Express App Entry Point

**Component:** `src/index.ts`
**Prompt used:**
> "Build the Express app entry point for MDGroup CTMS. Configure middleware stack
> (helmet, cors, morgan, json parser), mount Swagger UI at /api-docs, register
> all API routes, attach global error handler, and start HTTP server with
> graceful shutdown."

**Graceful shutdown:** SIGTERM/SIGINT handlers close the HTTP server then
disconnect Prisma before exiting — important in Kubernetes/Docker deployments
to avoid dropped in-flight requests.

---

## 19. Swagger Configuration

**Component:** `src/config/swagger.ts`
**Prompt used:**
> "Configure swagger-jsdoc and swagger-ui-express for MDGroup CTMS.
> Generate OpenAPI 3.0 spec from JSDoc annotations across all route files.
> Include bearer auth security scheme and organized tag groups."

**Endpoint:** API docs available at `GET /api-docs` (Swagger UI) and
`GET /api-docs.json` (raw OpenAPI JSON spec for import into Postman/Insomnia).

---

## 20. Database Seed

**Component:** `prisma/seed.ts`
**Prompt used:**
> "Write a realistic Prisma seed script for MDGroup CTMS with representative data:
> 2 sponsors (Pfizer, Novartis), 3 studies across different phases, 4 sites in
> US/UK/Germany, 10 participants with varied profiles, enrollments with different
> statuses, upcoming visits, travel arrangements, payments in various states,
> messages, and adverse events."

**Seed data coverage:**
- 5 users (1 admin, 1 coordinator, 2 navigators, 1 HCP)
- 2 sponsors, 3 studies (Phase 1/2/3), 4 sites (US×2, UK, DE)
- 6 study-site links, 10 participants (diverse nationalities/languages)
- 5 enrollments (active, screening, withdrawn), 6 visits (completed + scheduled)
- 4 travel arrangements, 2 HCP assignments, 3 equipment requests
- 5 payments (various statuses), 4 messages, 3 adverse events

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                     MDGroup CTMS Architecture                   │
├─────────────────────────────────────────────────────────────────┤
│  Client (Postman / Frontend)                                    │
│       ↓  HTTP REST                                              │
│  Express.js (helmet, cors, morgan)                              │
│       ↓                                                         │
│  JWT Auth Middleware → Role-Based Access Control                │
│       ↓                                                         │
│  Route Layer (12 route modules)                                 │
│       ↓                                                         │
│  Controller Layer (Zod validation → business logic)             │
│       ↓                                                         │
│  Prisma ORM (type-safe queries, migrations)                     │
│       ↓                                                         │
│  PostgreSQL (13 tables, 14 enums, indexes, constraints)         │
└─────────────────────────────────────────────────────────────────┘

Endpoint count: 57 endpoints across 12 resource groups
Entity count:   13 Prisma models
Enum count:     14 status/type enums
```

---

## Running the Application

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# 3. Initialize database (run once)
npx prisma generate
npx prisma db push

# 4. Seed with sample data
npm run db:seed

# 5. Start development server
npm run dev

# 6. Open API docs
open http://localhost:3000/api-docs
```
