import { Router } from "express";
import {
  listSites,
  getSite,
  createSite,
  updateSite,
  deleteSite,
  addSiteToStudy,
  removeSiteFromStudy,
} from "../controllers/site.controller";
import { verifyToken } from "../middleware/auth";

const router = Router();
router.use(verifyToken);

/**
 * @swagger
 * /api/sites:
 *   get:
 *     tags: [Sites]
 *     summary: List all sites
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of site objects
 *   post:
 *     tags: [Sites]
 *     summary: Create a new site
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
 *               address: { type: string }
 *               city: { type: string }
 *               state: { type: string }
 *               country: { type: string }
 *               principalInvestigator: { type: string }
 *               contactEmail: { type: string, format: email }
 *               contactPhone: { type: string }
 *     responses:
 *       201:
 *         description: Site created
 */
router.get("/", listSites);
router.post("/", createSite);

/**
 * @swagger
 * /api/sites/{id}:
 *   get:
 *     tags: [Sites]
 *     summary: Get a single site by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Site object
 *       404:
 *         description: Not found
 *   patch:
 *     tags: [Sites]
 *     summary: Update a site
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Updated site
 *   delete:
 *     tags: [Sites]
 *     summary: Delete a site
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
router.get("/:id", getSite);
router.patch("/:id", updateSite);
router.delete("/:id", deleteSite);

/**
 * @swagger
 * /api/sites/{id}/studies:
 *   post:
 *     tags: [Sites]
 *     summary: Associate a site with a study
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [studyId]
 *             properties:
 *               studyId: { type: string }
 *     responses:
 *       200:
 *         description: Site added to study
 *   delete:
 *     tags: [Sites]
 *     summary: Remove a site from a study
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [studyId]
 *             properties:
 *               studyId: { type: string }
 *     responses:
 *       200:
 *         description: Site removed from study
 */
router.post("/:id/studies", addSiteToStudy);
router.delete("/:id/studies", removeSiteFromStudy);

export default router;
