import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'local_storage.dart';
import '../constants/app_constants.dart';

enum SyncStatus { pending, synced, error }

class SyncEntry {
  final String id;
  final String entityType;
  final String action;
  final Map<String, dynamic> payload;
  SyncStatus status;

  SyncEntry({
    required this.id,
    required this.entityType,
    required this.action,
    required this.payload,
    this.status = SyncStatus.pending,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'entityType': entityType,
    'action': action,
    'payload': payload,
    'status': status.name,
  };

  factory SyncEntry.fromJson(Map<String, dynamic> json) => SyncEntry(
    id: json['id'] as String,
    entityType: json['entityType'] as String,
    action: json['action'] as String,
    payload: json['payload'] as Map<String, dynamic>,
    status: SyncStatus.values.firstWhere(
      (s) => s.name == json['status'],
      orElse: () => SyncStatus.pending,
    ),
  );
}

class SyncQueue extends ChangeNotifier {
  final List<SyncEntry> _queue = [];

  List<SyncEntry> get pending =>
      _queue.where((e) => e.status == SyncStatus.pending).toList();

  List<SyncEntry> get all => List.unmodifiable(_queue);

  Future<void> load() async {
    final storage = await LocalStorage.getInstance();
    final raw = storage.getStringList(StorageKeys.syncQueue);
    if (raw == null) return;
    _queue.addAll(raw.map((e) => SyncEntry.fromJson(jsonDecode(e))));
    notifyListeners();
  }

  Future<void> enqueue(SyncEntry entry) async {
    _queue.add(entry);
    await _persist();
    notifyListeners();
  }

  Future<void> markSynced(String id) async {
    final index = _queue.indexWhere((e) => e.id == id);
    if (index >= 0) {
      _queue[index].status = SyncStatus.synced;
      await _persist();
      notifyListeners();
    }
  }

  Future<void> markError(String id) async {
    final index = _queue.indexWhere((e) => e.id == id);
    if (index >= 0) {
      _queue[index].status = SyncStatus.error;
      await _persist();
      notifyListeners();
    }
  }

  Future<void> clearSynced() async {
    _queue.removeWhere((e) => e.status == SyncStatus.synced);
    await _persist();
    notifyListeners();
  }

  Future<void> _persist() async {
    final storage = await LocalStorage.getInstance();
    await storage.setStringList(
      StorageKeys.syncQueue,
      _queue.map((e) => jsonEncode(e.toJson())).toList(),
    );
  }
}
