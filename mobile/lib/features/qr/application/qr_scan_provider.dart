import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import '../data/consumption_repository.dart';
import '../domain/consumption_result_model.dart';

class QrScanProvider extends ChangeNotifier {
  final ConsumptionRepository _repository;
  final Uuid _uuid;

  bool _isCameraPermissionGranted = true;
  String? _cameraError;
  bool _isScanning = false;
  String _manualCode = '';
  ConsumptionResultModel? _lastResult;

  QrScanProvider(this._repository, {Uuid? uuid}) : _uuid = uuid ?? const Uuid();

  bool get isCameraPermissionGranted => _isCameraPermissionGranted;
  String? get cameraError => _cameraError;
  bool get isScanning => _isScanning;
  String get manualCode => _manualCode;
  ConsumptionResultModel? get lastResult => _lastResult;

  void setManualCode(String code) {
    _manualCode = code;
    notifyListeners();
  }

  void setCameraPermission(bool granted, {String? error}) {
    _isCameraPermissionGranted = granted;
    _cameraError = error;
    notifyListeners();
  }

  void resetResult() {
    _lastResult = null;
    _manualCode = '';
    _isScanning = false;
    notifyListeners();
  }

  Future<ConsumptionResultModel> submitScan({
    String? qrToken,
    String? manualCode,
  }) async {
    _isScanning = true;
    _lastResult = null;
    notifyListeners();

    final idempotencyKey = _uuid.v4();

    final result = await _repository.scanQrOrCode(
      qrToken: qrToken,
      manualCode: manualCode ?? _manualCode,
      idempotencyKey: idempotencyKey,
    );

    _lastResult = result;
    _isScanning = false;
    notifyListeners();

    return result;
  }
}
