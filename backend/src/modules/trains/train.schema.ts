import { z } from 'zod';

const trainStatusSchema = z.enum(['ONLINE', 'OFFLINE', 'MAINTENANCE', 'INACTIVE']);

/**
 * Validates the `:id` route parameter for train endpoints.
 */
export const trainIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/**
 * Validates the request body for creating a new train.
 */
export const createTrainSchema = z.object({
  trainNumber: z.string().trim().min(1).max(20),
  name: z.string().trim().min(1).max(100),
  line: z.string().trim().min(1).max(50),
  maxSpeed: z.number().int().positive().max(500).optional().default(250),
  status: trainStatusSchema.optional().default('INACTIVE'),
});

/**
 * Validates the request body for updating an existing train.
 */
export const updateTrainSchema = z
  .object({
    trainNumber: z.string().trim().min(1).max(20).optional(),
    name: z.string().trim().min(1).max(100).optional(),
    line: z.string().trim().min(1).max(50).optional(),
    maxSpeed: z.number().int().positive().max(500).optional(),
    status: trainStatusSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export type CreateTrainInput = z.infer<typeof createTrainSchema>;
export type UpdateTrainInput = z.infer<typeof updateTrainSchema>;
