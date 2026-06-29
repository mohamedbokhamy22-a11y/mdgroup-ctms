import { Router } from "express";
import {
  listSponsors,
  getSponsor,
  createSponsor,
  updateSponsor,
  deleteSponsor,
} from "../controllers/sponsor.controller";
import { verifyToken } from "../middleware/auth";

const router = Router();
router.use(verifyToken);

/**
 * @swagger
 * /api/sponsors:
 *   get:
 *     tags: [Sponsors]
 *     summary: List all sponsors
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of sponsor objects
 *   post:
 *     tags: [Sponsors]
 *     summary: Create a new sponsor
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               contactName: { type: string }
 *               contactEmail: { type: string, format: email }
 *               contactPhone: { type: string }
 *               address: { type: string }
 *     responses:
 *       201:
 *         description: Sponsor created
 */
router.get("/", listSponsors);
router.post("/", createSponsor);

/**
 * @swagger
 * /api/sponsors/{id}:
 *   get:
 *     tags: [Sponsors]
 *     summary: Get a single sponsor by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Sponsor object
 *       404:
 *         description: Not found
 *   patch:
 *     tags: [Sponsors]
 *     summary: Update a sponsor
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Updated sponsor
 *   delete:
 *     tags: [Sponsors]
 *     summary: Delete a sponsor
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
router.get("/:id", getSponsor);
router.patch("/:id", updateSponsor);
router.delete("/:id", deleteSponsor);

export default router;
