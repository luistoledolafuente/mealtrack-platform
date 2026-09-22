import { ApiError } from '../../shared/index.js';
import * as qrService from '../qr/qr.service.js';
import type { ScanConsumptionInput } from './consumptions.schema.js';

export async function scanLunch(
  data: ScanConsumptionInput,
  studentId: string,
  idempotencyKey: string | undefined,
) {
  if (!idempotencyKey) {
    throw new ApiError('Idempotency-Key es obligatorio', 400, 'IDEMPOTENCY_KEY_REQUIRED');
  }

  return qrService.scanRestaurantQrSession(data, studentId, idempotencyKey, 'lunch');
}
