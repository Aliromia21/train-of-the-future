import { AlertDTO, AlertEntity } from '../../shared/types';

function toIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

/**
 * Maps a database alert row to the camelCase API shape.
 */
export function toAlertDTO(entity: AlertEntity): AlertDTO {
  return {
    id: entity.id,
    trainId: entity.train_id,
    type: entity.type,
    severity: entity.severity,
    message: entity.message,
    isResolved: entity.is_resolved,
    createdAt: toIso(entity.created_at),
    resolvedAt: entity.resolved_at ? toIso(entity.resolved_at) : null,
  };
}
