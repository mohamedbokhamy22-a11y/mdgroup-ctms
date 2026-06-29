import { Router } from "express";
import {
  listParticipants,
  getParticipant,
  createParticipant,
  updateParticipant,
  deleteParticipant,
} from "../controllers/participant.controller";
import { verifyToken } from "../middleware/auth";

const router = Router();
router.use(verifyToken);

/**
 * @swagger
 * /api/participants:
 *   get:
 *     tags: [Participants]
 *     summary: List all participants
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of participant objects
 *   post:
 *     tags: [Participants]
 *     summary: Create a new participant
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, dateOfBirth]
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               dateOfBirth: { type: string, format: date }
 *               gender: { type: string }
 *               email: { type: string, format: email }
 *               phone: { type: string }
 *               address: { type: string }
 *               medicalRecordNumber: { type: string }
 *     responses:
 *       201:
 *         description: Participant created
 */
router.get("/", listParticipants);
router.post("/", createParticipant);

/**
 * @swagger
 * /api/participants/{id}:
 *   get:
 *     tags: [Participants]
 *     summary: Get a single participant by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Participant object
 *       404:
 *         description: Not found
 *   patch:
 *     tags: [Participants]
 *     summary: Update a participant
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Updated participant
 *   delete:
 *     tags: [Participants]
 *     summary: Delete a participant
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
router.get("/:id", getParticipant);
router.patch("/:id", updateParticipant);
router.delete("/:id", deleteParticipant);

export default router;
