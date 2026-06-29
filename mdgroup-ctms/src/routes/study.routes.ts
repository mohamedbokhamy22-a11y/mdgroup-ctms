import { Router } from "express";
import {
  listStudies,
  getStudy,
  createStudy,
  updateStudy,
  deleteStudy,
} from "../controllers/study.controller";
import { verifyToken } from "../middleware/auth";

const router = Router();
router.use(verifyToken);

/**
 * @swagger
 * /api/studies:
 *   get:
 *     tags: [Studies]
 *     summary: List all clinical studies
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of study objects
 *   post:
 *     tags: [Studies]
 *     summary: Create a new clinical study
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, protocolNumber, sponsorId]
 *             properties:
 *               title: { type: string }
 *               protocolNumber: { type: string }
 *               sponsorId: { type: string }
 *               phase: { type: string }
 *               status: { type: string }
 *               startDate: { type: string, format: date }
 *               endDate: { type: string, format: date }
 *     responses:
 *       201:
 *         description: Study created
 */
router.get("/", listStudies);
router.post("/", createStudy);

/**
 * @swagger
 * /api/studies/{id}:
 *   get:
 *     tags: [Studies]
 *     summary: Get a single study by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Study object
 *       404:
 *         description: Not found
 *   patch:
 *     tags: [Studies]
 *     summary: Update a study
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Updated study
 *   delete:
 *     tags: [Studies]
 *     summary: Delete a study
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
router.get("/:id", getStudy);
router.patch("/:id", updateStudy);
router.delete("/:id", deleteStudy);

export default router;
