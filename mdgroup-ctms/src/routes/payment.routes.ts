import { Router } from "express";
import {
  listPayments,
  getPayment,
  createPayment,
  updatePayment,
  approvePayment,
  deletePayment,
} from "../controllers/payment.controller";
import { verifyToken } from "../middleware/auth";

const router = Router();
router.use(verifyToken);

/**
 * @swagger
 * /api/payments:
 *   get:
 *     tags: [Payments]
 *     summary: List all payments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of payment objects
 *   post:
 *     tags: [Payments]
 *     summary: Create a new payment record
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [enrollmentId, amount, paymentType]
 *             properties:
 *               enrollmentId: { type: string }
 *               amount: { type: number }
 *               paymentType: { type: string }
 *               currency: { type: string, default: USD }
 *               status: { type: string }
 *               dueDate: { type: string, format: date }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Payment created
 */
router.get("/", listPayments);
router.post("/", createPayment);

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     tags: [Payments]
 *     summary: Get a single payment by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Payment object
 *       404:
 *         description: Not found
 *   patch:
 *     tags: [Payments]
 *     summary: Update a payment record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Updated payment
 *   delete:
 *     tags: [Payments]
 *     summary: Delete a payment record
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
router.get("/:id", getPayment);
router.patch("/:id", updatePayment);
router.delete("/:id", deletePayment);

/**
 * @swagger
 * /api/payments/{id}/approve:
 *   patch:
 *     tags: [Payments]
 *     summary: Approve a pending payment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Payment approved
 *       404:
 *         description: Not found
 */
router.patch("/:id/approve", approvePayment);

export default router;
