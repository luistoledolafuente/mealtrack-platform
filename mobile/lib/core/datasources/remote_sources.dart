import '../../core/network/api_client.dart';
import '../../core/constants/app_constants.dart';
import '../../core/models/models.dart';

class SubscriptionRemoteSource {
  final ApiClient _api;

  SubscriptionRemoteSource(this._api);

  Future<List<SubscriptionModel>> getMySubscriptions() async {
    final res = await _api.get(ApiConstants.subscriptions);
    final data = res['data'];
    if (data is List) {
      return data.map((e) => SubscriptionModel.fromJson(e)).toList();
    }
    return [];
  }
}

class DailyMealRemoteSource {
  final ApiClient _api;

  DailyMealRemoteSource(this._api);

  Future<List<DailyMealModel>> getMeals({String? month, String? year}) async {
    final params = <String, String>{};
    if (month != null) params['month'] = month;
    if (year != null) params['year'] = year;
    final res = await _api.get(ApiConstants.dailyMeals, queryParams: params.isNotEmpty ? params : null);
    final data = res['data'];
    if (data is List) {
      return data.map((e) => DailyMealModel.fromJson(e)).toList();
    }
    return [];
  }

  Future<void> registerMeal({
    required String subscriptionId,
    required String date,
    required String status,
    String? validationMethod,
  }) async {
    await _api.post(ApiConstants.dailyMeals, body: {
      'subscriptionId': subscriptionId,
      'date': date,
      'status': status,
      'validationMethod': validationMethod,
    });
  }
}

class PaymentRemoteSource {
  final ApiClient _api;

  PaymentRemoteSource(this._api);

  Future<List<PaymentModel>> getMyPayments() async {
    final res = await _api.get(ApiConstants.payments);
    final data = res['data'];
    if (data is List) {
      return data.map((e) => PaymentModel.fromJson(e)).toList();
    }
    return [];
  }
}

class NotificationRemoteSource {
  final ApiClient _api;

  NotificationRemoteSource(this._api);

  Future<List<NotificationModel>> getNotifications() async {
    final res = await _api.get(ApiConstants.notifications);
    final data = res['data'];
    if (data is List) {
      return data.map((e) => NotificationModel.fromJson(e)).toList();
    }
    return [];
  }

  Future<void> markAsRead(String id) async {
    await _api.patch('${ApiConstants.notifications}/$id/read');
  }

  Future<void> markAllAsRead() async {
    await _api.patch('${ApiConstants.notifications}/read-all');
  }
}

class AdjustmentRemoteSource {
  final ApiClient _api;

  AdjustmentRemoteSource(this._api);

  Future<List<AdjustmentRequestModel>> getMyAdjustments() async {
    final res = await _api.get(ApiConstants.adjustmentRequests);
    final data = res['data'];
    if (data is List) {
      return data.map((e) => AdjustmentRequestModel.fromJson(e)).toList();
    }
    return [];
  }

  Future<void> createAdjustment({
    required String dailyMealId,
    required String reason,
  }) async {
    await _api.post(ApiConstants.adjustmentRequests, body: {
      'dailyMealId': dailyMealId,
      'reason': reason,
    });
  }
}

class AuditRemoteSource {
  final ApiClient _api;

  AuditRemoteSource(this._api);

  Future<List<AuditLogModel>> getAuditLogs() async {
    final res = await _api.get(ApiConstants.auditLogs);
    final data = res['data'];
    if (data is List) {
      return data.map((e) => AuditLogModel.fromJson(e)).toList();
    }
    return [];
  }
}

class DashboardRemoteSource {
  final ApiClient _api;

  DashboardRemoteSource(this._api);

  Future<StudentDashboardModel> getStudentDashboard() async {
    final res = await _api.get(ApiConstants.studentDashboard);
    final data = res['data'] as Map<String, dynamic>;
    return StudentDashboardModel.fromJson(data);
  }

  Future<DashboardSummaryModel> getAdminDashboard() async {
    final res = await _api.get(ApiConstants.adminDashboard);
    final data = res['data'] as Map<String, dynamic>;
    return DashboardSummaryModel.fromJson(data);
  }
}

class QrRemoteSource {
  final ApiClient _api;

  QrRemoteSource(this._api);

  Future<Map<String, dynamic>> issueQr(String subscriptionId) async {
    final res = await _api.post(ApiConstants.qrIssue, body: {
      'subscriptionId': subscriptionId,
    });
    return res['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> validateQr(String token) async {
    final res = await _api.post(ApiConstants.qrValidate, body: {
      'token': token,
    });
    return res['data'] as Map<String, dynamic>;
  }
}
