import { Router } from "express";
import {
  listMessages,
  getMessage,
  sendMessage,
  markMessagesRead,
  deleteMessage,
} from "../controllers/message.controller";
import { verifyToken } from "../middleware/auth";

const router = Router();
router.use(verifyToken);

/**
 * @swagger
 * /api/messages:
 *   get:
 *     tags: [Messages]
 *     summary: List all messages for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of message objects
 *   post:
 *     tags: [Messages]
 *     summary: Send a new message
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [recipientId, subject, body]
 *             properties:
 *               recipientId: { type: string }
 *               subject: { type: string }
 *               body: { type: string }
 *               studyId: { type: string }
 *               enrollmentId: { type: string }
 *     responses:
 *       201:
 *         description: Message sent
 */
router.get("/", listMessages);
router.post("/", sendMessage);

/**
 * @swagger
 * /api/messages/mark-read:
 *   patch:
 *     tags: [Messages]
 *     summary: Mark one or more messages as read
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [messageIds]
 *             properties:
 *               messageIds:
 *                 type: array
 *                 items: { type: string }
 *     responses:
 *       200:
 *         description: Messages marked as read
 */
router.patch("/mark-read", markMessagesRead);

/**
 * @swagger
 * /api/messages/{id}:
 *   get:
 *     tags: [Messages]
 *     summary: Get a single message by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Message object
 *       404:
 *         description: Not found
 *   delete:
 *     tags: [Messages]
 *     summary: Delete a message
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
router.get("/:id", getMessage);
router.delete("/:id", deleteMessage);

export default router;
