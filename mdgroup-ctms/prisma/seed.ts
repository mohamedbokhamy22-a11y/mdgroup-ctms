// Prompt: "Write a realistic Prisma seed script for MDGroup CTMS with representative data:
// 2 sponsors (Pfizer, Novartis), 3 studies across different phases, 4 sites in US/UK/Germany,
// 10 participants with varied profiles, enrollments with different statuses, upcoming visits,
// travel arrangements, payments in various states, messages, and adverse events."

import { PrismaClient, UserRole, StudyPhase, StudyStatus, EnrollmentStatus,
  VisitType, VisitStatus, TravelMode, TravelStatus, PaymentType, PaymentStatus,
  PaymentMethod, EquipmentStatus, MessageDirection, AdverseEventSeverity,
  AdverseEventStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL as string });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding MDGroup CTMS database...\n");

  // ── Users ──────────────────────────────────────────────────────────────────
  console.log("Creating users...");
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@mdgroup.com" },
    update: {},
    create: { email: "admin@mdgroup.com", passwordHash, firstName: "Sarah", lastName: "Mitchell", role: UserRole.ADMIN, phone: "+44-20-7946-0001" },
  });

  const coordinator = await prisma.user.upsert({
    where: { email: "james.chen@mdgroup.com" },
    update: {},
    create: { email: "james.chen@mdgroup.com", passwordHash, firstName: "James", lastName: "Chen", role: UserRole.COORDINATOR, phone: "+44-20-7946-0002" },
  });

  const navigator1 = await prisma.user.upsert({
    where: { email: "priya.sharma@mdgroup.com" },
    update: {},
    create: { email: "priya.sharma@mdgroup.com", passwordHash, firstName: "Priya", lastName: "Sharma", role: UserRole.NAVIGATOR, phone: "+44-20-7946-0003" },
  });

  const navigator2 = await prisma.user.upsert({
    where: { email: "lucas.weber@mdgroup.com" },
    update: {},
    create: { email: "lucas.weber@mdgroup.com", passwordHash, firstName: "Lucas", lastName: "Weber", role: UserRole.NAVIGATOR, phone: "+49-30-1234-5678" },
  });

  const hcp1 = await prisma.user.upsert({
    where: { email: "dr.nguyen@mdgroup.com" },
    update: {},
    create: { email: "dr.nguyen@mdgroup.com", passwordHash, firstName: "Anh", lastName: "Nguyen", role: UserRole.SITE_STAFF, phone: "+1-617-555-0101" },
  });

  console.log("  ✓ 5 users created");

  // ── Sponsors ───────────────────────────────────────────────────────────────
  console.log("Creating sponsors...");
  const pfizer = await prisma.sponsor.upsert({
    where: { id: "sponsor-pfizer-001" },
    update: {},
    create: { id: "sponsor-pfizer-001", name: "Pfizer Inc.", contactEmail: "clinical-ops@pfizer.com", contactPhone: "+1-212-733-2323", address: "235 East 42nd Street", country: "United States" },
  });

  const novartis = await prisma.sponsor.upsert({
    where: { id: "sponsor-novartis-001" },
    update: {},
    create: { id: "sponsor-novartis-001", name: "Novartis AG", contactEmail: "trials@novartis.com", contactPhone: "+41-61-324-1111", address: "Novartis Campus, Fabrikstrasse 14", country: "Switzerland" },
  });

  console.log("  ✓ 2 sponsors created");

  // ── Studies ────────────────────────────────────────────────────────────────
  console.log("Creating studies...");
  const study1 = await prisma.study.upsert({
    where: { protocolNumber: "PFZ-ONCO-2024-001" },
    update: {},
    create: {
      protocolNumber: "PFZ-ONCO-2024-001",
      title: "A Phase 3 Study of PF-07321332 in Patients with Advanced Non-Small Cell Lung Cancer",
      phase: StudyPhase.PHASE_3, status: StudyStatus.ACTIVE,
      indication: "Non-Small Cell Lung Cancer (NSCLC)",
      therapeuticArea: "Oncology",
      sponsorId: pfizer.id,
      startDate: new Date("2024-03-01"), endDate: new Date("2026-12-31"),
      targetEnrollment: 450,
      description: "Randomized, double-blind, placebo-controlled study evaluating efficacy and safety of PF-07321332 as first-line treatment.",
    },
  });

  const study2 = await prisma.study.upsert({
    where: { protocolNumber: "NVS-CARD-2024-002" },
    update: {},
    create: {
      protocolNumber: "NVS-CARD-2024-002",
      title: "Phase 2 Dose-Ranging Study of NVS-4556 for Treatment-Resistant Hypertension",
      phase: StudyPhase.PHASE_2, status: StudyStatus.ACTIVE,
      indication: "Treatment-Resistant Hypertension",
      therapeuticArea: "Cardiovascular",
      sponsorId: novartis.id,
      startDate: new Date("2024-06-15"), endDate: new Date("2026-06-14"),
      targetEnrollment: 180,
    },
  });

  const study3 = await prisma.study.upsert({
    where: { protocolNumber: "PFZ-NEUR-2025-003" },
    update: {},
    create: {
      protocolNumber: "PFZ-NEUR-2025-003",
      title: "Phase 1 Safety and Tolerability Study of PF-09876543 in Early Alzheimer's Disease",
      phase: StudyPhase.PHASE_1, status: StudyStatus.ACTIVE,
      indication: "Alzheimer's Disease",
      therapeuticArea: "Neurology",
      sponsorId: pfizer.id,
      startDate: new Date("2025-01-10"), endDate: new Date("2026-12-31"),
      targetEnrollment: 60,
    },
  });

  console.log("  ✓ 3 studies created");

  // ── Sites ──────────────────────────────────────────────────────────────────
  console.log("Creating sites...");
  const siteBoston = await prisma.site.upsert({
    where: { siteCode: "US-BOS-001" },
    update: {},
    create: { siteCode: "US-BOS-001", name: "Massachusetts General Hospital — Oncology Research Unit", address: "55 Fruit Street", city: "Boston", country: "United States", principalInvestigator: "Dr. Richard Feldman", contactEmail: "clinical.trials@mgh.org", contactPhone: "+1-617-726-2000" },
  });

  const siteLondon = await prisma.site.upsert({
    where: { siteCode: "UK-LON-001" },
    update: {},
    create: { siteCode: "UK-LON-001", name: "University College London Hospital — Clinical Research Facility", address: "235 Euston Road", city: "London", country: "United Kingdom", principalInvestigator: "Prof. Helen Cartwright", contactEmail: "research@uclh.nhs.uk", contactPhone: "+44-20-3456-7890" },
  });

  const siteBerlin = await prisma.site.upsert({
    where: { siteCode: "DE-BER-001" },
    update: {},
    create: { siteCode: "DE-BER-001", name: "Charité Universitätsmedizin Berlin — Kardiovaskuläres Forschungszentrum", address: "Charitéplatz 1", city: "Berlin", country: "Germany", principalInvestigator: "Dr. Klaus Hoffmann", contactEmail: "studien@charite.de", contactPhone: "+49-30-450-50" },
  });

  const siteNewYork = await prisma.site.upsert({
    where: { siteCode: "US-NYC-001" },
    update: {},
    create: { siteCode: "US-NYC-001", name: "Memorial Sloan Kettering Cancer Center", address: "1275 York Avenue", city: "New York", country: "United States", principalInvestigator: "Dr. Maria Santos", contactEmail: "trials@mskcc.org", contactPhone: "+1-212-639-2000" },
  });

  console.log("  ✓ 4 sites created");

  // ── Study-Site Links ───────────────────────────────────────────────────────
  const studySiteLinks = [
    { studyId: study1.id, siteId: siteBoston.id },
    { studyId: study1.id, siteId: siteNewYork.id },
    { studyId: study1.id, siteId: siteLondon.id },
    { studyId: study2.id, siteId: siteBerlin.id },
    { studyId: study2.id, siteId: siteLondon.id },
    { studyId: study3.id, siteId: siteBoston.id },
  ];

  for (const link of studySiteLinks) {
    await prisma.studySite.upsert({
      where: { studyId_siteId: { studyId: link.studyId, siteId: link.siteId } },
      update: {},
      create: { ...link, activatedAt: new Date() },
    });
  }
  console.log("  ✓ 6 study-site links created");

  // ── Participants ───────────────────────────────────────────────────────────
  console.log("Creating participants...");
  const participants = await Promise.all([
    prisma.participant.upsert({ where: { externalRef: "MDG-PAT-00001" }, update: {}, create: { externalRef: "MDG-PAT-00001", firstName: "Eleanor", lastName: "Whitmore", dateOfBirth: new Date("1958-04-12"), email: "e.whitmore@email.com", phone: "+1-617-555-0201", city: "Cambridge", country: "United States", language: "en", notes: "Prefers morning appointments" } }),
    prisma.participant.upsert({ where: { externalRef: "MDG-PAT-00002" }, update: {}, create: { externalRef: "MDG-PAT-00002", firstName: "Thomas", lastName: "Brandt", dateOfBirth: new Date("1965-09-28"), email: "t.brandt@mail.de", phone: "+49-30-5555-0202", city: "Berlin", country: "Germany", language: "de", requiresAssistance: true, emergencyContact: "Anna Brandt +49-30-5555-0203" } }),
    prisma.participant.upsert({ where: { externalRef: "MDG-PAT-00003" }, update: {}, create: { externalRef: "MDG-PAT-00003", firstName: "Aisha", lastName: "Okonkwo", dateOfBirth: new Date("1972-01-15"), phone: "+44-20-7555-0203", city: "London", country: "United Kingdom", language: "en" } }),
    prisma.participant.upsert({ where: { externalRef: "MDG-PAT-00004" }, update: {}, create: { externalRef: "MDG-PAT-00004", firstName: "Robert", lastName: "Gallagher", dateOfBirth: new Date("1950-11-03"), email: "r.gallagher@email.com", phone: "+1-212-555-0204", city: "New York", country: "United States", language: "en", requiresAssistance: true } }),
    prisma.participant.upsert({ where: { externalRef: "MDG-PAT-00005" }, update: {}, create: { externalRef: "MDG-PAT-00005", firstName: "Mei", lastName: "Zhang", dateOfBirth: new Date("1980-07-22"), email: "m.zhang@email.com", phone: "+44-20-7555-0205", city: "London", country: "United Kingdom", language: "zh" } }),
    prisma.participant.upsert({ where: { externalRef: "MDG-PAT-00006" }, update: {}, create: { externalRef: "MDG-PAT-00006", firstName: "Carlos", lastName: "Mendoza", dateOfBirth: new Date("1963-03-08"), phone: "+1-617-555-0206", city: "Boston", country: "United States", language: "es", notes: "Spanish interpreter required" } }),
    prisma.participant.upsert({ where: { externalRef: "MDG-PAT-00007" }, update: {}, create: { externalRef: "MDG-PAT-00007", firstName: "Ingrid", lastName: "Svensson", dateOfBirth: new Date("1975-12-17"), email: "i.svensson@email.se", phone: "+46-8-555-0207", city: "London", country: "United Kingdom", language: "sv" } }),
    prisma.participant.upsert({ where: { externalRef: "MDG-PAT-00008" }, update: {}, create: { externalRef: "MDG-PAT-00008", firstName: "Mohammed", lastName: "Al-Rashid", dateOfBirth: new Date("1968-06-30"), phone: "+1-212-555-0208", city: "New York", country: "United States", language: "ar" } }),
    prisma.participant.upsert({ where: { externalRef: "MDG-PAT-00009" }, update: {}, create: { externalRef: "MDG-PAT-00009", firstName: "Yuki", lastName: "Tanaka", dateOfBirth: new Date("1982-02-14"), email: "y.tanaka@email.jp", phone: "+44-20-7555-0209", city: "London", country: "United Kingdom", language: "ja" } }),
    prisma.participant.upsert({ where: { externalRef: "MDG-PAT-00010" }, update: {}, create: { externalRef: "MDG-PAT-00010", firstName: "Grace", lastName: "Adeyemi", dateOfBirth: new Date("1955-08-19"), phone: "+1-617-555-0210", city: "Boston", country: "United States", language: "en", requiresAssistance: true } }),
  ]);

  console.log("  ✓ 10 participants created");

  // ── Enrollments ────────────────────────────────────────────────────────────
  console.log("Creating enrollments...");
  const e1 = await prisma.enrollment.upsert({
    where: { participantId_studyId: { participantId: participants[0].id, studyId: study1.id } },
    update: {},
    create: { participantId: participants[0].id, studyId: study1.id, siteId: siteBoston.id, status: EnrollmentStatus.ACTIVE, screeningDate: new Date("2024-04-01"), enrollmentDate: new Date("2024-04-15"), subjectNumber: "PFZ-001-BOS-001" },
  });
  const e2 = await prisma.enrollment.upsert({
    where: { participantId_studyId: { participantId: participants[1].id, studyId: study2.id } },
    update: {},
    create: { participantId: participants[1].id, studyId: study2.id, siteId: siteBerlin.id, status: EnrollmentStatus.ACTIVE, screeningDate: new Date("2024-07-01"), enrollmentDate: new Date("2024-07-20"), subjectNumber: "NVS-002-BER-001" },
  });
  const e3 = await prisma.enrollment.upsert({
    where: { participantId_studyId: { participantId: participants[2].id, studyId: study1.id } },
    update: {},
    create: { participantId: participants[2].id, studyId: study1.id, siteId: siteLondon.id, status: EnrollmentStatus.ACTIVE, screeningDate: new Date("2024-05-10"), enrollmentDate: new Date("2024-05-24"), subjectNumber: "PFZ-001-LON-001" },
  });
  const e4 = await prisma.enrollment.upsert({
    where: { participantId_studyId: { participantId: participants[3].id, studyId: study3.id } },
    update: {},
    create: { participantId: participants[3].id, studyId: study3.id, siteId: siteBoston.id, status: EnrollmentStatus.SCREENING, screeningDate: new Date("2025-02-01"), subjectNumber: "PFZ-003-BOS-001" },
  });
  const e5 = await prisma.enrollment.upsert({
    where: { participantId_studyId: { participantId: participants[4].id, studyId: study2.id } },
    update: {},
    create: { participantId: participants[4].id, studyId: study2.id, siteId: siteLondon.id, status: EnrollmentStatus.WITHDRAWN, screeningDate: new Date("2024-08-01"), enrollmentDate: new Date("2024-08-20"), withdrawalDate: new Date("2024-11-15"), withdrawalReason: "Participant moved abroad", subjectNumber: "NVS-002-LON-001" },
  });

  console.log("  ✓ 5 enrollments created");

  // ── Visits ─────────────────────────────────────────────────────────────────
  console.log("Creating visits...");
  const v1 = await prisma.visit.create({ data: { enrollmentId: e1.id, siteId: siteBoston.id, visitType: VisitType.SITE_BASED, status: VisitStatus.COMPLETED, visitNumber: 1, visitName: "Baseline", scheduledDate: new Date("2024-04-20"), completedDate: new Date("2024-04-20"), duration: 180 } });
  const v2 = await prisma.visit.create({ data: { enrollmentId: e1.id, siteId: siteBoston.id, visitType: VisitType.SITE_BASED, status: VisitStatus.COMPLETED, visitNumber: 2, visitName: "Week 4 Assessment", scheduledDate: new Date("2024-05-18"), completedDate: new Date("2024-05-18"), duration: 120 } });
  const v3 = await prisma.visit.create({ data: { enrollmentId: e1.id, siteId: siteBoston.id, visitType: VisitType.HOME_VISIT, status: VisitStatus.SCHEDULED, visitNumber: 3, visitName: "Week 8 Home Visit", scheduledDate: new Date("2026-07-15"), duration: 90 } });
  const v4 = await prisma.visit.create({ data: { enrollmentId: e2.id, siteId: siteBerlin.id, visitType: VisitType.SITE_BASED, status: VisitStatus.COMPLETED, visitNumber: 1, visitName: "Screening Visit", scheduledDate: new Date("2024-07-20"), completedDate: new Date("2024-07-20"), duration: 240 } });
  const v5 = await prisma.visit.create({ data: { enrollmentId: e3.id, siteId: siteLondon.id, visitType: VisitType.TELEHEALTH, status: VisitStatus.SCHEDULED, visitNumber: 3, visitName: "Week 8 Telehealth Check-in", scheduledDate: new Date("2026-07-20"), duration: 45 } });
  const v6 = await prisma.visit.create({ data: { enrollmentId: e4.id, siteId: siteBoston.id, visitType: VisitType.SITE_BASED, status: VisitStatus.SCHEDULED, visitNumber: 1, visitName: "Screening / Cognitive Assessment", scheduledDate: new Date("2026-07-02"), duration: 300 } });

  console.log("  ✓ 6 visits created");

  // ── Travel Arrangements ────────────────────────────────────────────────────
  console.log("Creating travel arrangements...");
  await prisma.travelArrangement.create({ data: { participantId: participants[0].id, visitId: v1.id, travelMode: TravelMode.TAXI, status: TravelStatus.COMPLETED, origin: "24 Cambridge Street, Cambridge, MA", destination: "Massachusetts General Hospital, Boston, MA", departureDate: new Date("2024-04-20T08:00:00Z"), returnDate: new Date("2024-04-20T14:00:00Z"), supplier: "Uber Health", estimatedCost: 45, actualCost: 42.50 } });
  await prisma.travelArrangement.create({ data: { participantId: participants[1].id, visitId: v4.id, travelMode: TravelMode.TRAIN, status: TravelStatus.COMPLETED, origin: "Berlin Ostbahnhof", destination: "Charité Universitätsmedizin, Berlin", departureDate: new Date("2024-07-20T07:30:00Z"), bookingRef: "DB-2024-07-TBR001", supplier: "Deutsche Bahn", estimatedCost: 12, actualCost: 12.0 } });
  await prisma.travelArrangement.create({ data: { participantId: participants[3].id, visitId: v6.id, travelMode: TravelMode.FLIGHT, status: TravelStatus.BOOKED, origin: "New York JFK", destination: "Boston Logan Airport", departureDate: new Date("2026-07-02T06:00:00Z"), returnDate: new Date("2026-07-02T20:00:00Z"), bookingRef: "JB2026BOS007", supplier: "JetBlue Airways", estimatedCost: 280 } });
  await prisma.travelArrangement.create({ data: { participantId: participants[3].id, visitId: v6.id, travelMode: TravelMode.TAXI, status: TravelStatus.BOOKED, origin: "Boston Logan Airport", destination: "Massachusetts General Hospital, Boston", departureDate: new Date("2026-07-02T08:30:00Z"), supplier: "Uber Health", estimatedCost: 35 } });

  console.log("  ✓ 4 travel arrangements created");

  // ── HCP Assignments ────────────────────────────────────────────────────────
  console.log("Creating HCP assignments...");
  await prisma.hCPAssignment.create({ data: { visitId: v3.id, userId: hcp1.id, specialty: "Oncology Nursing", confirmedAt: new Date(), notes: "Home visit — Eleanor Whitmore, Week 8" } });
  await prisma.hCPAssignment.create({ data: { visitId: v6.id, userId: hcp1.id, specialty: "Neuropsychology", confirmedAt: new Date(), notes: "Cognitive assessment battery — MMSE, MoCA, CDR" } });

  console.log("  ✓ 2 HCP assignments created");

  // ── Equipment Requests ─────────────────────────────────────────────────────
  console.log("Creating equipment requests...");
  await prisma.equipmentRequest.create({ data: { visitId: v3.id, equipmentName: "Portable ECG Monitor (12-lead)", quantity: 1, status: EquipmentStatus.DISPATCHED, supplier: "Welch Allyn", trackingNumber: "FX789012345GB", dispatchedAt: new Date("2026-07-10") } });
  await prisma.equipmentRequest.create({ data: { visitId: v3.id, equipmentName: "Blood Collection Kit (EDTA tubes × 6)", quantity: 1, status: EquipmentStatus.DISPATCHED, supplier: "BD Vacutainer", trackingNumber: "FX789012346GB", dispatchedAt: new Date("2026-07-10") } });
  await prisma.equipmentRequest.create({ data: { visitId: v6.id, equipmentName: "Neuropsychological Assessment Tablet (MoCA App)", quantity: 2, status: EquipmentStatus.ALLOCATED, supplier: "NeuroPsych Digital" } });

  console.log("  ✓ 3 equipment requests created");

  // ── Payments ───────────────────────────────────────────────────────────────
  console.log("Creating payments...");
  await prisma.payment.create({ data: { participantId: participants[0].id, paymentType: PaymentType.STIPEND, status: PaymentStatus.PAID, amount: 150, currency: "USD", paymentMethod: PaymentMethod.PREPAID_CARD, description: "Baseline visit stipend — Visit 1", visitId: v1.id, createdById: coordinator.id, approvedById: adminUser.id, processedAt: new Date("2024-04-22"), paidAt: new Date("2024-04-23"), referenceNumber: "PAY-2024-000001" } });
  await prisma.payment.create({ data: { participantId: participants[0].id, paymentType: PaymentType.TRAVEL_REIMBURSEMENT, status: PaymentStatus.PAID, amount: 42.50, currency: "USD", paymentMethod: PaymentMethod.BANK_TRANSFER, description: "Taxi reimbursement — Baseline visit", visitId: v1.id, createdById: navigator1.id, approvedById: coordinator.id, paidAt: new Date("2024-04-25"), referenceNumber: "PAY-2024-000002" } });
  await prisma.payment.create({ data: { participantId: participants[1].id, paymentType: PaymentType.STIPEND, status: PaymentStatus.PAID, amount: 200, currency: "EUR", paymentMethod: PaymentMethod.BANK_TRANSFER, description: "Screening visit stipend", visitId: v4.id, createdById: coordinator.id, approvedById: adminUser.id, paidAt: new Date("2024-07-25"), referenceNumber: "PAY-2024-000003" } });
  await prisma.payment.create({ data: { participantId: participants[3].id, paymentType: PaymentType.TRAVEL_REIMBURSEMENT, status: PaymentStatus.APPROVED, amount: 280, currency: "USD", paymentMethod: PaymentMethod.PREPAID_CARD, description: "Flight reimbursement — NYC to Boston, Screening Visit", visitId: v6.id, createdById: navigator1.id, approvedById: coordinator.id, processedAt: new Date(), referenceNumber: "PAY-2026-000004" } });
  await prisma.payment.create({ data: { participantId: participants[3].id, paymentType: PaymentType.STIPEND, status: PaymentStatus.PENDING, amount: 200, currency: "USD", paymentMethod: PaymentMethod.PREPAID_CARD, description: "Screening visit stipend — PFZ-003-BOS-001", visitId: v6.id, createdById: navigator1.id, referenceNumber: "PAY-2026-000005" } });

  console.log("  ✓ 5 payments created");

  // ── Messages ───────────────────────────────────────────────────────────────
  console.log("Creating messages...");
  await prisma.message.create({ data: { participantId: participants[0].id, navigatorId: navigator1.id, direction: MessageDirection.OUTBOUND, subject: "Your Week 8 Home Visit — July 15th", body: "Dear Eleanor,\n\nI hope you're doing well! I'm writing to confirm your upcoming home visit scheduled for Monday, July 15th between 10:00 AM - 12:00 PM.\n\nOur clinical nurse, Dr. Nguyen, will visit you at your home address on record. Please ensure you have fasted for 4 hours prior to the visit.\n\nPlease don't hesitate to reach out if you have any questions.\n\nBest regards,\nPriya Sharma\nPatient Navigator, MDGroup", isRead: true, readAt: new Date("2026-07-01T09:15:00Z") } });
  await prisma.message.create({ data: { participantId: participants[0].id, navigatorId: navigator1.id, direction: MessageDirection.INBOUND, subject: "RE: Your Week 8 Home Visit — July 15th", body: "Hi Priya,\n\nThank you for the reminder. The timing works perfectly for me. Will Dr. Nguyen need access to a specific room or should I prepare anything at home?\n\nBest,\nEleanor", isRead: true, readAt: new Date("2026-07-01T11:00:00Z") } });
  await prisma.message.create({ data: { participantId: participants[1].id, navigatorId: navigator2.id, direction: MessageDirection.OUTBOUND, subject: "Ihre Reisearrangements für den nächsten Besuch", body: "Sehr geehrter Herr Brandt,\n\nIch freue mich, Ihnen mitteilen zu können, dass die Reisearrangements für Ihren nächsten Besuch bestätigt wurden.\n\nMit freundlichen Grüßen,\nLucas Weber\nPatientennavigator, MDGroup", isRead: false } });
  await prisma.message.create({ data: { participantId: participants[3].id, navigatorId: navigator1.id, direction: MessageDirection.OUTBOUND, subject: "Travel Arrangements Confirmed — Boston Screening Visit", body: "Dear Robert,\n\nYour travel arrangements for your screening visit on July 2nd are now confirmed:\n\n• Flight: JetBlue JB2026BOS007 — NYC JFK → Boston Logan (06:00 departure)\n• Ground transport: Uber Health pickup from Logan → MGH (08:30)\n\nYour stipend of $200 will be processed following the visit.\n\nKind regards,\nPriya Sharma", isRead: false } });

  console.log("  ✓ 4 messages created");

  // ── Adverse Events ─────────────────────────────────────────────────────────
  console.log("Creating adverse events...");
  await prisma.adverseEvent.create({ data: { participantId: participants[0].id, severity: AdverseEventSeverity.MILD, status: AdverseEventStatus.RESOLVED, eventDate: new Date("2024-05-02"), description: "Mild nausea lasting approximately 2 hours following study medication administration. No intervention required.", outcome: "Resolved without treatment within 24 hours", reportedToSponsor: true, resolvedAt: new Date("2024-05-03") } });
  await prisma.adverseEvent.create({ data: { participantId: participants[1].id, severity: AdverseEventSeverity.MODERATE, status: AdverseEventStatus.RESOLVED, eventDate: new Date("2024-09-15"), description: "Orthostatic hypotension observed at Week 8 visit. BP dropped from 145/90 to 95/60 upon standing. Patient symptomatic (dizziness).", outcome: "Dose adjustment implemented. Resolved within 2 weeks.", reportedToSponsor: true, resolvedAt: new Date("2024-09-30") } });
  await prisma.adverseEvent.create({ data: { participantId: participants[2].id, severity: AdverseEventSeverity.MILD, status: AdverseEventStatus.ONGOING, eventDate: new Date("2024-08-20"), description: "Injection site reaction — mild erythema and swelling at the injection site, approximately 2cm diameter. No systemic symptoms.", reportedToSponsor: true } });

  console.log("  ✓ 3 adverse events created");

  console.log("\n✅ Seeding complete!");
  console.log("\n📋 Login credentials:");
  console.log("  Admin:       admin@mdgroup.com / Password123!");
  console.log("  Coordinator: james.chen@mdgroup.com / Password123!");
  console.log("  Navigator:   priya.sharma@mdgroup.com / Password123!");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
