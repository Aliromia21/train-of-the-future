import { AppError } from '../../shared/middleware/errorHandler';
import { TrainDTO } from '../../shared/types';
import { toTrainDTO, toTrainDTOList } from './trainMapper';
import * as trainRepository from './trainRepository';
import { CreateTrainInput, UpdateTrainInput } from './train.schema';

/**
 * Retrieves all trains from the fleet.
 * @returns List of train DTOs
 */
export async function getAllTrains(): Promise<TrainDTO[]> {
  const trains = await trainRepository.findAll();
  return toTrainDTOList(trains);
}

/**
 * Retrieves a single train by ID.
 * @param id - Train primary key
 * @returns Train DTO
 * @throws AppError with status 404 when the train does not exist
 */
export async function getTrainById(id: number): Promise<TrainDTO> {
  const train = await trainRepository.findById(id);

  if (!train) {
    throw new AppError(404, `Train with id ${id} not found`);
  }

  return toTrainDTO(train);
}

/**
 * Creates a new train in the fleet.
 * @param input - Validated train creation payload
 * @returns Newly created train DTO
 * @throws AppError with status 409 when train_number already exists
 */
export async function createTrain(input: CreateTrainInput): Promise<TrainDTO> {
  const existing = await trainRepository.findByTrainNumber(input.trainNumber);

  if (existing) {
    throw new AppError(409, `Train number '${input.trainNumber}' already exists`);
  }

  const created = await trainRepository.create({
    train_number: input.trainNumber,
    name: input.name,
    line: input.line,
    max_speed: input.maxSpeed,
    status: input.status,
  });

  return toTrainDTO(created);
}

/**
 * Updates an existing train.
 * @param id - Train primary key
 * @param input - Validated partial update payload
 * @returns Updated train DTO
 * @throws AppError with status 404 when the train does not exist
 * @throws AppError with status 409 when train_number is taken by another train
 */
export async function updateTrain(id: number, input: UpdateTrainInput): Promise<TrainDTO> {
  const existing = await trainRepository.findById(id);

  if (!existing) {
    throw new AppError(404, `Train with id ${id} not found`);
  }

  const nextTrainNumber = input.trainNumber ?? existing.train_number;

  if (nextTrainNumber !== existing.train_number) {
    const duplicate = await trainRepository.findByTrainNumber(nextTrainNumber);

    if (duplicate && duplicate.id !== id) {
      throw new AppError(409, `Train number '${nextTrainNumber}' already exists`);
    }
  }

  const updated = await trainRepository.update(id, {
    train_number: nextTrainNumber,
    name: input.name ?? existing.name,
    line: input.line ?? existing.line,
    max_speed: input.maxSpeed ?? existing.max_speed,
    status: input.status ?? existing.status,
  });

  if (!updated) {
    throw new AppError(404, `Train with id ${id} not found`);
  }

  return toTrainDTO(updated);
}

/**
 * Removes a train from the fleet.
 * @param id - Train primary key
 * @throws AppError with status 404 when the train does not exist
 */
export async function deleteTrain(id: number): Promise<void> {
  const deleted = await trainRepository.deleteById(id);

  if (!deleted) {
    throw new AppError(404, `Train with id ${id} not found`);
  }
}
