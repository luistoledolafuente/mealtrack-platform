import * as repository from './adjustment-requests.repository.js';
import * as dailyMealRepository from '../daily-meals/daily-meals.repository.js';
import { ApiError } from '../../shared/index.js';

export async function list(userId: string, role: string, restaurantId: string | null) {
  if (role === 'student') {
    return repository.findByRequester(userId);
  }
  if (restaurantId) {
    return repository.findByDailyMealInRestaurant(restaurantId);
  }
  return [];
}

export async function create(data: {
  dailyMealId: string;
  reason: string;
}, userId: string) {
  const dailyMeal = await dailyMealRepository.findById(data.dailyMealId);
  if (!dailyMeal) {
    throw new ApiError('Consumo diario no encontrado', 404, 'DAILY_MEAL_NOT_FOUND');
  }

  return repository.create({
    dailyMealId: data.dailyMealId,
    requesterId: userId,
    reason: data.reason,
  });
}

export async function review(id: string, data: {
  decision: string;
  resolutionNotes?: string;
}, reviewerId: string) {
  const request = await repository.findById(id);
  if (!request) {
    throw new ApiError('Solicitud de ajuste no encontrada', 404, 'ADJUSTMENT_NOT_FOUND');
  }

  const updated = await repository.review(id, {
    status: data.decision,
    reviewerId,
    resolution: data.resolutionNotes,
  });

  if (data.decision === 'approved') {
    await dailyMealRepository.updateStatus(request.dailyMealId, 'adjusted');
  }

  return updated;
}
