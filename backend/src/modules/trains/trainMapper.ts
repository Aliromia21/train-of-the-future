import { TrainDTO, TrainEntity } from '../../shared/types';

/**
 * Maps a database train entity to an API response DTO.
 * @param entity - Raw train row from SQL Server
 * @returns Train data in camelCase for API consumers
 */
export function toTrainDTO(entity: TrainEntity): TrainDTO {
  return {
    id: entity.id,
    trainNumber: entity.train_number,
    name: entity.name,
    line: entity.line,
    maxSpeed: entity.max_speed,
    status: entity.status,
    createdAt: entity.created_at instanceof Date
      ? entity.created_at.toISOString()
      : new Date(entity.created_at).toISOString(),
  };
}

/**
 * Maps a list of database train entities to API response DTOs.
 * @param entities - Raw train rows from SQL Server
 * @returns List of trains in camelCase
 */
export function toTrainDTOList(entities: TrainEntity[]): TrainDTO[] {
  return entities.map(toTrainDTO);
}
