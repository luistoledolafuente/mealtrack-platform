class ServiceBalance {
  final String service;
  final String serviceName;
  final int contractedCount;
  final int remainingCount;
  final bool included;

  const ServiceBalance({
    required this.service,
    required this.serviceName,
    required this.contractedCount,
    required this.remainingCount,
    this.included = true,
  });

  factory ServiceBalance.fromJson(Map<String, dynamic> json) => ServiceBalance(
        service: json['service'] as String? ?? '',
        serviceName: json['serviceName'] as String? ?? '',
        contractedCount: json['contractedCount'] as int? ?? 0,
        remainingCount: json['remainingCount'] as int? ?? 0,
        included: json['included'] as bool? ?? true,
      );

  Map<String, dynamic> toJson() => {
        'service': service,
        'serviceName': serviceName,
        'contractedCount': contractedCount,
        'remainingCount': remainingCount,
        'included': included,
      };
}

class RestaurantClosureAlert {
  final String id;
  final String restaurantName;
  final String reason;
  final List<String> affectedServices;
  final DateTime startDate;
  final DateTime endDate;
  final int validityExtendedDays;

  const RestaurantClosureAlert({
    required this.id,
    required this.restaurantName,
    required this.reason,
    required this.affectedServices,
    required this.startDate,
    required this.endDate,
    required this.validityExtendedDays,
  });

  factory RestaurantClosureAlert.fromJson(Map<String, dynamic> json) =>
      RestaurantClosureAlert(
        id: json['id'] as String? ?? '',
        restaurantName: json['restaurantName'] as String? ?? '',
        reason: json['reason'] as String? ?? '',
        affectedServices: (json['affectedServices'] as List<dynamic>?)
                ?.map((e) => e as String)
                .toList() ??
            [],
        startDate: json['startDate'] != null
            ? DateTime.parse(json['startDate'] as String)
            : DateTime.now(),
        endDate: json['endDate'] != null
            ? DateTime.parse(json['endDate'] as String)
            : DateTime.now(),
        validityExtendedDays: json['validityExtendedDays'] as int? ?? 0,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'restaurantName': restaurantName,
        'reason': reason,
        'affectedServices': affectedServices,
        'startDate': startDate.toIso8601String(),
        'endDate': endDate.toIso8601String(),
        'validityExtendedDays': validityExtendedDays,
      };
}

class AbsenceNoticeItem {
  final String id;
  final DateTime date;
  final String service;
  final String status;
  final String reason;

  const AbsenceNoticeItem({
    required this.id,
    required this.date,
    required this.service,
    required this.status,
    required this.reason,
  });

  factory AbsenceNoticeItem.fromJson(Map<String, dynamic> json) =>
      AbsenceNoticeItem(
        id: json['id'] as String? ?? '',
        date: json['date'] != null
            ? DateTime.parse(json['date'] as String)
            : DateTime.now(),
        service: json['service'] as String? ?? '',
        status: json['status'] as String? ?? 'pending',
        reason: json['reason'] as String? ?? '',
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'date': date.toIso8601String(),
        'service': service,
        'status': status,
        'reason': reason,
      };
}

class PensionSummaryModel {
  final String subscriptionId;
  final String status;
  final String mealPlanName;
  final String restaurantName;
  final DateTime validityStartDate;
  final DateTime validityEndDate;
  final List<ServiceBalance> serviceBalances;
  final List<RestaurantClosureAlert> closureAlerts;
  final List<AbsenceNoticeItem> absences;
  final int monthlyAbsenceLimit;
  final int usedAbsences;

  const PensionSummaryModel({
    required this.subscriptionId,
    required this.status,
    required this.mealPlanName,
    required this.restaurantName,
    required this.validityStartDate,
    required this.validityEndDate,
    required this.serviceBalances,
    required this.closureAlerts,
    required this.absences,
    required this.monthlyAbsenceLimit,
    required this.usedAbsences,
  });

  bool get isActive => status == 'active';

  factory PensionSummaryModel.fromJson(Map<String, dynamic> json) =>
      PensionSummaryModel(
        subscriptionId: json['subscriptionId'] as String? ?? '',
        status: json['status'] as String? ?? 'inactive',
        mealPlanName: json['mealPlanName'] as String? ?? '',
        restaurantName: json['restaurantName'] as String? ?? '',
        validityStartDate: json['validityStartDate'] != null
            ? DateTime.parse(json['validityStartDate'] as String)
            : DateTime.now(),
        validityEndDate: json['validityEndDate'] != null
            ? DateTime.parse(json['validityEndDate'] as String)
            : DateTime.now(),
        serviceBalances: (json['serviceBalances'] as List<dynamic>?)
                ?.map((e) => ServiceBalance.fromJson(e as Map<String, dynamic>))
                .toList() ??
            [],
        closureAlerts: (json['closureAlerts'] as List<dynamic>?)
                ?.map((e) =>
                    RestaurantClosureAlert.fromJson(e as Map<String, dynamic>))
                .toList() ??
            [],
        absences: (json['absences'] as List<dynamic>?)
                ?.map((e) =>
                    AbsenceNoticeItem.fromJson(e as Map<String, dynamic>))
                .toList() ??
            [],
        monthlyAbsenceLimit: json['monthlyAbsenceLimit'] as int? ?? 3,
        usedAbsences: json['usedAbsences'] as int? ?? 0,
      );

  Map<String, dynamic> toJson() => {
        'subscriptionId': subscriptionId,
        'status': status,
        'mealPlanName': mealPlanName,
        'restaurantName': restaurantName,
        'validityStartDate': validityStartDate.toIso8601String(),
        'validityEndDate': validityEndDate.toIso8601String(),
        'serviceBalances': serviceBalances.map((e) => e.toJson()).toList(),
        'closureAlerts': closureAlerts.map((e) => e.toJson()).toList(),
        'absences': absences.map((e) => e.toJson()).toList(),
        'monthlyAbsenceLimit': monthlyAbsenceLimit,
        'usedAbsences': usedAbsences,
      };
}
