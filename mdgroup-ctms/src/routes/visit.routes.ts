import { Router } from "express";
import {
  listVisits,
  getVisit,
  createVisit,
  updateVisit,
  deleteVisit,
} from "../controllers/visit.controller";
import { verifyToken } from "../middleware/auth";

const router = Router();
router.use(verifyToken);

/**
 * @swagger
 * /api/visits:
 *   get:
 *     tags: [Visits]
 *     summary: List all visits
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of visit objects
 *   post:
 *     tags: [Visits]
 *     summary: Schedule a new visit
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [enrollmentId, visitDate, visitType]
 *             properties:
 *               enrollmentId: { type: string }
 *               visitDate: { type: string, format: date-time }
 *               visitType: { type: string }
 *               status: { type: string }
 *               notes: { type: string }
 *               completedAt: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Visit created
 */
router.get("/", listVisits);
router.post("/", createVisit);

/**
 * @swagger
 * /api/visits/{id}:
 *   get:
 *     tags: [Visits]
 *     summary: Get a single visit by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Visit object
 *       404:
 *         description: Not found
 *   patch:
 *     tags: [Visits]
 *     summary: Update a visit
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Updated visit
 *   delete:
 *     tags: [Visits]
 *     summary: Delete a visit
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
router.get("/:id", getVisit);
router.patch("/:id", updateVisit);
router.delete("/:id", deleteVisit);

export default router;
