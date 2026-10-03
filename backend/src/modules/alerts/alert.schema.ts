import { z } from 'zod';

/**
 * Validates the `:id` route parameter for alert endpoints.
 */
export const alertIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/**
 * Validates query filters for listing alerts.
 * Open alerts are the default so the dashboard can call the route with no query.
 */
export const listAlertsQuerySchema = z.object({
  status: z.enum(['open', 'resolved', 'all']).optional().default('open'),
  trainId: z.coerce.number().int().positive().optional(),
});

export type ListAlertsQuery = z.infer<typeof listAlertsQuerySchema>;
