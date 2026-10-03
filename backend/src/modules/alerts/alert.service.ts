import { AlertEvent } from './alert.engine';
import { toAlertDTO } from './alert.mapper';
import {
  AlertListFilter,
  OpenAlertExistsError,
  findById,
  findMany,
  findOpen,
  insert,
  markResolved,
} from './alert.repository';
import { AppError } from '../../shared/middleware/errorHandler';
import { AlertDTO } from '../../shared/types';

/**
 * Stores an alert when the train has no open alert of the same type.
 * @returns The stored alert, or null when the event is a duplicate
 */
export async function record(event: AlertEvent): Promise<AlertDTO | null> {
  const existing = await findOpen(event.trainId, event.type);
  if (existing) {
    return null;
  }

  try {
    const created = await insert({
      train_id: event.trainId,
      type: event.type,
      severity: event.severity,
      message: event.message,
    });
    return toAlertDTO(created);
  } catch (err) {
    if (err instanceof OpenAlertExistsError) {
      return null;
    }
    throw err;
  }
}

/**
 * Lists alerts for the dashboard and history views.
 */
export async function listAlerts(filter: AlertListFilter): Promise<AlertDTO[]> {
  const rows = await findMany(filter);
  return rows.map(toAlertDTO);
}

/**
 * Closes an open alert.
 * @throws AppError 404 when the alert does not exist
 * @throws AppError 409 when the alert is already resolved
 */
export async function resolveAlert(id: number): Promise<AlertDTO> {
  const existing = await findById(id);
  if (!existing) {
    throw new AppError(404, `Alert with id ${id} not found`);
  }
  if (existing.is_resolved) {
    throw new AppError(409, `Alert with id ${id} is already resolved`);
  }

  const updated = await markResolved(id);
  if (!updated) {
    throw new AppError(409, `Alert with id ${id} is already resolved`);
  }

  return toAlertDTO(updated);
}
