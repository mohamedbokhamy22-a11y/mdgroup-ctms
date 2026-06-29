import { Router } from "express";
import {
  listTravel,
  getTravel,
  createTravel,
  updateTravel,
  deleteTravel,
} from "../controllers/travel.controller";
import { verifyToken } from "../middleware/auth";

const router = Router();
router.use(verifyToken);

/**
 * @swagger
 * /api/travel:
 *   get:
 *     tags: [Travel]
 *     summary: List all travel requests
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of travel objects
 *   post:
 *     tags: [Travel]
 *     summary: Create a new travel request
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [enrollmentId, travelDate, origin, destination]
 *             properties:
 *               enrollmentId: { type: string }
 *               travelDate: { type: string, format: date }
 *               origin: { type: string }
 *               destination: { type: string }
 *               mode: { type: string }
 *               estimatedCost: { type: number }
 *               status: { type: string }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Travel request created
 */
router.get("/", listTravel);
router.post("/", createTravel);

/**
 * @swagger
 * /api/travel/{id}:
 *   get:
 *     tags: [Travel]
 *     summary: Get a single travel request by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Travel object
 *       404:
 *         description: Not found
 *   patch:
 *     tags: [Travel]
 *     summary: Update a travel request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Updated travel record
 *   delete:
 *     tags: [Travel]
 *     summary: Delete a travel request
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
router.get("/:id", getTravel);
router.patch("/:id", updateTravel);
router.delete("/:id", deleteTravel);

export default router;
