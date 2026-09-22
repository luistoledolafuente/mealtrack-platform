import 'package:flutter/material.dart';
import '../data/pension_repository.dart';
import '../domain/pension_models.dart';

class PensionProvider extends ChangeNotifier {
  final PensionRepository _repository;

  PensionSummaryModel? _summary;
  bool _loading = false;
  String? _error;

  PensionProvider(this._repository);

  PensionSummaryModel? get summary => _summary;
  bool get loading => _loading;
  String? get error => _error;

  Future<void> loadPensionSummary() async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      _summary = await _repository.getPensionSummary();
    } catch (e) {
      _error = 'Error al cargar el resumen de pensión';
    } finally {
      _loading = false;
      notifyListeners();
    }
  }
}
