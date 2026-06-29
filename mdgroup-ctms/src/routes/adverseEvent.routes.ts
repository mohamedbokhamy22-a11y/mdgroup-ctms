import { Router } from "express";
import {
  listAdverseEvents,
  getAdverseEvent,
  createAdverseEvent,
  updateAdverseEvent,
  deleteAdverseEvent,
} from "../controllers/adverseEvent.controller";
import { verifyToken } from "../middleware/auth";

const router = Router();
router.use(verifyToken);

/**
 * @swagger
 * /api/adverse-events:
 *   get:
 *     tags: [AdverseEvents]
 *     summary: List all adverse events
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of adverse event objects
 *   post:
 *     tags: [AdverseEvents]
 *     summary: Report a new adverse event
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [enrollmentId, description, severity, onsetDate]
 *             properties:
 *               enrollmentId: { type: string }
 *               description: { type: string }
 *               severity:
 *                 type: string
 *                 enum: [MILD, MODERATE, SEVERE, LIFE_THREATENING, FATAL]
 *               onsetDate: { type: string, format: date }
 *               resolvedDate: { type: string, format: date }
 *               outcome: { type: string }
 *               reportedById: { type: string }
 *               seriousness: { type: string }
 *               relationship: { type: string }
 *               action: { type: string }
 *     responses:
 *       201:
 *         description: Adverse event reported
 */
router.get("/", listAdverseEvents);
router.post("/", createAdverseEvent);

/**
 * @swagger
 * /api/adverse-events/{id}:
 *   get:
 *     tags: [AdverseEvents]
 *     summary: Get a single adverse event by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Adverse event object
 *       404:
 *         description: Not found
 *   patch:
 *     tags: [AdverseEvents]
 *     summary: Update an adverse event report
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Updated adverse event
 *   delete:
 *     tags: [AdverseEvents]
 *     summary: Delete an adverse event report
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Deleted
 */
router.get("/:id", getAdverseEvent);
router.patch("/:id", updateAdverseEvent);
router.delete("/:id", deleteAdverseEvent);

export default router;
