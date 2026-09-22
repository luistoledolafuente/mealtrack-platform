class ConsumptionResultModel {
  final bool success;
  final String service;
  final String serviceName;
  final int remainingBalance;
  final DateTime timestamp;
  final String restaurantName;
  final String? branchName;
  final String validationMethod;
  final String? errorCode;
  final String? errorMessage;

  const ConsumptionResultModel({
    required this.success,
    this.service = '',
    this.serviceName = '',
    this.remainingBalance = 0,
    required this.timestamp,
    this.restaurantName = '',
    this.branchName,
    this.validationMethod = 'qr_scan',
    this.errorCode,
    this.errorMessage,
  });

  factory ConsumptionResultModel.fromJson(Map<String, dynamic> json) =>
      ConsumptionResultModel(
        success: json['success'] as bool? ?? false,
        service: json['service'] as String? ?? json['data']?['service'] as String? ?? '',
        serviceName: json['serviceName'] as String? ?? json['data']?['serviceName'] as String? ?? '',
        remainingBalance: json['remainingBalance'] as int? ?? json['data']?['remainingBalance'] as int? ?? 0,
        timestamp: json['timestamp'] != null
            ? DateTime.parse(json['timestamp'] as String)
            : (json['data']?['timestamp'] != null
                ? DateTime.parse(json['data']['timestamp'] as String)
                : DateTime.now()),
        restaurantName: json['restaurantName'] as String? ?? json['data']?['restaurantName'] as String? ?? '',
        branchName: json['branchName'] as String? ?? json['data']?['branchName'] as String?,
        validationMethod: json['validationMethod'] as String? ?? json['data']?['validationMethod'] as String? ?? 'qr_scan',
        errorCode: json['error']?['code'] as String? ?? json['errorCode'] as String?,
        errorMessage: json['message'] as String? ?? json['errorMessage'] as String?,
      );

  factory ConsumptionResultModel.failure({
    required String errorCode,
    required String errorMessage,
  }) =>
      ConsumptionResultModel(
        success: false,
        timestamp: DateTime.now(),
        errorCode: errorCode,
        errorMessage: errorMessage,
      );
}
