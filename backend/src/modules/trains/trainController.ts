import { Request, Response, NextFunction } from 'express';
import * as trainService from './trainService';
import {
  createTrainSchema,
  trainIdParamSchema,
  updateTrainSchema,
} from './train.schema';

/**
 * Handles GET /api/trains — returns the full train fleet list.
 */
export async function getTrains(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const trains = await trainService.getAllTrains();

    res.status(200).json({
      success: true,
      data: trains,
      message: 'Trains retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handles GET /api/trains/:id — returns a single train by ID.
 */
export async function getTrainById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = trainIdParamSchema.parse(req.params);
    const train = await trainService.getTrainById(id);

    res.status(200).json({
      success: true,
      data: train,
      message: 'Train retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handles POST /api/trains — creates a new train.
 */
export async function createTrain(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = createTrainSchema.parse(req.body);
    const train = await trainService.createTrain(input);

    res.status(201).json({
      success: true,
      data: train,
      message: 'Train created successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handles PUT /api/trains/:id — updates an existing train.
 */
export async function updateTrain(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = trainIdParamSchema.parse(req.params);
    const input = updateTrainSchema.parse(req.body);
    const train = await trainService.updateTrain(id, input);

    res.status(200).json({
      success: true,
      data: train,
      message: 'Train updated successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handles DELETE /api/trains/:id — removes a train from the fleet.
 */
export async function deleteTrain(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = trainIdParamSchema.parse(req.params);
    await trainService.deleteTrain(id);

    res.status(200).json({
      success: true,
      data: null,
      message: 'Train deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
