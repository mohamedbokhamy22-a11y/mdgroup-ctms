import { Router } from "express";
import {
  listEquipment,
  getEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
} from "../controllers/equipment.controller";
import { verifyToken } from "../middleware/auth";

const router = Router();
router.use(verifyToken);

/**
 * @swagger
 * /api/equipment:
 *   get:
 *     tags: [Equipment]
 *     summary: List all equipment records
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of equipment objects
 *   post:
 *     tags: [Equipment]
 *     summary: Add a new equipment record
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, siteId]
 *             properties:
 *               name: { type: string }
 *               siteId: { type: string }
 *               serialNumber: { type: string }
 *               manufacturer: { type: string }
 *               model: { type: string }
 *               calibrationDate: { type: string, format: date }
 *               nextCalibrationDate: { type: string, format: date }
 *               status: { type: string }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Equipment record created
 */
router.get("/", listEquipment);
router.post("/", createEquipment);

/**
 * @swagger
 * /api/equipment/{id}:
 *   get:
 *     tags: [Equipment]
 *     summary: Get a single equipment record by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Equipment object
 *       404:
 *         description: Not found
 *   patch:
 *     tags: [Equipment]
 *     summary: Update an equipment record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Updated equipment record
 *   delete:
 *     tags: [Equipment]
 *     summary: Delete an equipment record
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
router.get("/:id", getEquipment);
router.patch("/:id", updateEquipment);
router.delete("/:id", deleteEquipment);

export default router;
