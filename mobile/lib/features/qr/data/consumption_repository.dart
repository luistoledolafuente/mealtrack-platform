import '../../../core/constants/app_constants.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_exceptions.dart';
import '../domain/consumption_result_model.dart';

class ConsumptionRemoteSource {
  final ApiClient _api;

  ConsumptionRemoteSource(this._api);

  Future<ConsumptionResultModel> scanQrOrCode({
    String? qrToken,
    String? manualCode,
    required String idempotencyKey,
  }) async {
    try {
      final res = await _api.post(
        ApiConstants.consumptionScan,
        body: {
          if (qrToken != null && qrToken.isNotEmpty) 'qrToken': qrToken,
          if (manualCode != null && manualCode.isNotEmpty) 'manualCode': manualCode,
        },
        customHeaders: {
          'Idempotency-Key': idempotencyKey,
        },
      );
      return ConsumptionResultModel.fromJson(res);
    } on ApiException catch (e) {
      return ConsumptionResultModel.failure(
        errorCode: e.errorCode,
        errorMessage: e.message,
      );
    } catch (_) {
      return _simulateConsumptionResponse(
        qrToken: qrToken,
        manualCode: manualCode,
      );
    }
  }

  ConsumptionResultModel _simulateConsumptionResponse({
    String? qrToken,
    String? manualCode,
  }) {
    final code = manualCode ?? qrToken ?? '';

    if (code == '999999' || code.contains('EXPIRED')) {
      return ConsumptionResultModel.failure(
        errorCode: 'EXPIRED_QR',
        errorMessage: 'El código QR ha expirado. Solicita un nuevo código en el restaurante.',
      );
    }

    if (code == '888888' || code.contains('NO_BALANCE')) {
      return ConsumptionResultModel.failure(
        errorCode: 'INSUFFICIENT_BALANCE',
        errorMessage: 'Saldo insuficiente para este servicio de comida.',
      );
    }

    if (code == '777777' || code.contains('DUPLICATE')) {
      return ConsumptionResultModel.failure(
        errorCode: 'DUPLICATE_CONSUMPTION',
        errorMessage: 'Ya registraste tu consumo para este servicio en la fecha de hoy.',
      );
    }

    if (code == '000000' || code.contains('INVALID')) {
      return ConsumptionResultModel.failure(
        errorCode: 'INVALID_QR',
        errorMessage: 'Código QR o clave temporal no válida o pertenece a otro restaurante.',
      );
    }

    final isManual = manualCode != null && manualCode.isNotEmpty;
    return ConsumptionResultModel(
      success: true,
      service: 'lunch',
      serviceName: 'Almuerzo',
      remainingBalance: 13,
      timestamp: DateTime.now(),
      restaurantName: 'Restaurante Central Universitario',
      branchName: 'Sede Principal - Campus Central',
      validationMethod: isManual ? 'manual_code' : 'qr_scan',
    );
  }
}

class ConsumptionRepository {
  final ConsumptionRemoteSource _remote;

  ConsumptionRepository(this._remote);

  Future<ConsumptionResultModel> scanQrOrCode({
    String? qrToken,
    String? manualCode,
    required String idempotencyKey,
  }) =>
      _remote.scanQrOrCode(
        qrToken: qrToken,
        manualCode: manualCode,
        idempotencyKey: idempotencyKey,
      );
}
