import { Router } from 'express';
import {
  createTrain,
  deleteTrain,
  getTrainById,
  getTrains,
  updateTrain,
} from './trainController';

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Train:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         trainNumber:
 *           type: string
 *           example: ICE-101
 *         name:
 *           type: string
 *           example: Hannover Express
 *         line:
 *           type: string
 *           example: Hannover–Berlin
 *         maxSpeed:
 *           type: integer
 *           example: 300
 *         status:
 *           type: string
 *           enum: [ONLINE, OFFLINE, MAINTENANCE, INACTIVE]
 *         createdAt:
 *           type: string
 *           format: date-time
 *     CreateTrainRequest:
 *       type: object
 *       required: [trainNumber, name, line]
 *       properties:
 *         trainNumber:
 *           type: string
 *           example: ICE-999
 *         name:
 *           type: string
 *           example: Test Express
 *         line:
 *           type: string
 *           example: Hannover–Berlin
 *         maxSpeed:
 *           type: integer
 *           example: 250
 *         status:
 *           type: string
 *           enum: [ONLINE, OFFLINE, MAINTENANCE, INACTIVE]
 *     UpdateTrainRequest:
 *       type: object
 *       properties:
 *         trainNumber:
 *           type: string
 *         name:
 *           type: string
 *         line:
 *           type: string
 *         maxSpeed:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [ONLINE, OFFLINE, MAINTENANCE, INACTIVE]
 *     ApiSuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           nullable: true
 *         message:
 *           type: string
 */

/**
 * @openapi
 * /trains:
 *   get:
 *     tags: [Trains]
 *     summary: Get all trains in the fleet
 *     responses:
 *       200:
 *         description: List of trains
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
 *                         $ref: '#/components/schemas/Train'
 *   post:
 *     tags: [Trains]
 *     summary: Create a new train
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTrainRequest'
 *     responses:
 *       201:
 *         description: Train created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Train'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Train number already exists
 */
router.get('/', getTrains);
router.post('/', createTrain);

/**
 * @openapi
 * /trains/{id}:
 *   get:
 *     tags: [Trains]
 *     summary: Get a single train by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Train found
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Train'
 *       404:
 *         description: Train not found
 *   put:
 *     tags: [Trains]
 *     summary: Update an existing train
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTrainRequest'
 *     responses:
 *       200:
 *         description: Train updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Train'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Train not found
 *       409:
 *         description: Train number already exists
 *   delete:
 *     tags: [Trains]
 *     summary: Delete a train
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Train deleted
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       nullable: true
 *       404:
 *         description: Train not found
 */
router.get('/:id', getTrainById);
router.put('/:id', updateTrain);
router.delete('/:id', deleteTrain);

export default router;
