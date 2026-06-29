import { Router } from "express";
import {
  listEnrollments,
  getEnrollment,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
} from "../controllers/enrollment.controller";
import { verifyToken } from "../middleware/auth";

const router = Router();
router.use(verifyToken);

/**
 * @swagger
 * /api/enrollments:
 *   get:
 *     tags: [Enrollments]
 *     summary: List all enrollments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of enrollment objects
 *   post:
 *     tags: [Enrollments]
 *     summary: Enroll a participant in a study
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [participantId, studyId, siteId]
 *             properties:
 *               participantId: { type: string }
 *               studyId: { type: string }
 *               siteId: { type: string }
 *               enrollmentDate: { type: string, format: date }
 *               status: { type: string }
 *               consentDate: { type: string, format: date }
 *     responses:
 *       201:
 *         description: Enrollment created
 */
router.get("/", listEnrollments);
router.post("/", createEnrollment);

/**
 * @swagger
 * /api/enrollments/{id}:
 *   get:
 *     tags: [Enrollments]
 *     summary: Get a single enrollment by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Enrollment object
 *       404:
 *         description: Not found
 *   patch:
 *     tags: [Enrollments]
 *     summary: Update an enrollment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Updated enrollment
 *   delete:
 *     tags: [Enrollments]
 *     summary: Delete an enrollment
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
router.get("/:id", getEnrollment);
router.patch("/:id", updateEnrollment);
router.delete("/:id", deleteEnrollment);

export default router;
