import { Express } from "express";
import authRoutes from "./auth.routes";
import sponsorRoutes from "./sponsor.routes";
import studyRoutes from "./study.routes";
import siteRoutes from "./site.routes";
import participantRoutes from "./participant.routes";
import enrollmentRoutes from "./enrollment.routes";
import visitRoutes from "./visit.routes";
import travelRoutes from "./travel.routes";
import paymentRoutes from "./payment.routes";
import equipmentRoutes from "./equipment.routes";
import messageRoutes from "./message.routes";
import adverseEventRoutes from "./adverseEvent.routes";

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication and user account management
 *   - name: Sponsors
 *     description: Clinical trial sponsor management
 *   - name: Studies
 *     description: Clinical study protocol management
 *   - name: Sites
 *     description: Research site management and study associations
 *   - name: Participants
 *     description: Trial participant demographics and records
 *   - name: Enrollments
 *     description: Participant study enrollment and consent tracking
 *   - name: Visits
 *     description: Scheduled and completed participant visits
 *   - name: Travel
 *     description: Participant travel request and reimbursement management
 *   - name: Payments
 *     description: Participant stipend and payment tracking
 *   - name: Equipment
 *     description: Site equipment inventory and calibration tracking
 *   - name: Messages
 *     description: Internal messaging between CTMS users
 *   - name: AdverseEvents
 *     description: Adverse event reporting and safety tracking
 */

/**
 * Mounts all application route groups onto the Express app.
 *
 * Public routes:
 *   POST   /api/auth/register  — create a new user account
 *   POST   /api/auth/login     — authenticate and receive a JWT
 *   GET    /api/auth/me        — get current user (token required at route level)
 *
 * Protected routes (verifyToken applied at the individual router level):
 *   /api/sponsors        — sponsor CRUD
 *   /api/studies         — study CRUD
 *   /api/sites           — site CRUD + study associations
 *   /api/participants    — participant CRUD
 *   /api/enrollments     — enrollment CRUD
 *   /api/visits          — visit scheduling and tracking
 *   /api/travel          — travel request management
 *   /api/payments        — payment records and approval workflow
 *   /api/equipment       — equipment inventory and calibration
 *   /api/messages        — internal messaging
 *   /api/adverse-events  — adverse event reporting
 */
export function registerRoutes(app: Express): void {
  // Auth — verifyToken is applied per-route inside auth.routes.ts
  app.use("/api/auth", authRoutes);

  // All remaining route groups carry verifyToken via router.use(verifyToken)
  app.use("/api/sponsors", sponsorRoutes);
  app.use("/api/studies", studyRoutes);
  app.use("/api/sites", siteRoutes);
  app.use("/api/participants", participantRoutes);
  app.use("/api/enrollments", enrollmentRoutes);
  app.use("/api/visits", visitRoutes);
  app.use("/api/travel", travelRoutes);
  app.use("/api/payments", paymentRoutes);
  app.use("/api/equipment", equipmentRoutes);
  app.use("/api/messages", messageRoutes);
  app.use("/api/adverse-events", adverseEventRoutes);
}
