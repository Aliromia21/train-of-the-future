import { Router } from 'express';
import { getAlerts, resolveAlertById } from './alert.controller';

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Alert:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 7
 *         trainId:
 *           type: integer
 *           example: 1
 *         type:
 *           type: string
 *           enum: [OFFLINE, WIFI_DEGRADED, SPEED_VIOLATION, DELAY]
 *         severity:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *         message:
 *           type: string
 *         isResolved:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         resolvedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 */

/**
 * @openapi
 * /alerts:
 *   get:
 *     tags: [Alerts]
 *     summary: List fleet alerts
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, resolved, all]
 *           default: open
 *       - in: query
 *         name: trainId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Alerts matching the filter
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Alert'
 *       400:
 *         description: Invalid query
 */
router.get('/', getAlerts);

/**
 * @openapi
 * /alerts/{id}/resolve:
 *   patch:
 *     tags: [Alerts]
 *     summary: Resolve an open alert
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Alert resolved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Alert'
 *       400:
 *         description: Invalid id
 *       404:
 *         description: Alert not found
 *       409:
 *         description: Alert is already resolved
 */
router.patch('/:id/resolve', resolveAlertById);

export default router;
