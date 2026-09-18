class UserModel {
  final String id;
  final String fullName;
  final String email;
  final String? phone;
  final String role;
  final String? restaurantId;
  final bool isActive;
  final bool mustChangePassword;
  final DateTime createdAt;

  const UserModel({
    required this.id,
    required this.fullName,
    required this.email,
    this.phone,
    required this.role,
    this.restaurantId,
    this.isActive = true,
    this.mustChangePassword = false,
    required this.createdAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) => UserModel(
        id: json['id'] as String,
        fullName: json['fullName'] as String,
        email: json['email'] as String,
        phone: json['phone'] as String?,
        role: json['role'] as String,
        restaurantId: json['restaurantId'] as String?,
        isActive: json['isActive'] as bool? ?? true,
        mustChangePassword: json['mustChangePassword'] as bool? ?? false,
        createdAt: DateTime.parse(json['createdAt'] as String),
      );
}

class MealPlanModel {
  final String id;
  final String name;
  final double price;
  final int durationDays;
  final bool isActive;

  const MealPlanModel({
    required this.id,
    required this.name,
    required this.price,
    required this.durationDays,
    this.isActive = true,
  });

  factory MealPlanModel.fromJson(Map<String, dynamic> json) => MealPlanModel(
        id: json['id'] as String,
        name: json['name'] as String,
        price: (json['price'] as num).toDouble(),
        durationDays: json['durationDays'] as int,
        isActive: json['isActive'] as bool? ?? true,
      );
}

class SubscriptionModel {
  final String id;
  final String studentId;
  final String mealPlanId;
  final String restaurantId;
  final DateTime startDate;
  final int contractedDays;
  final int remainingDays;
  final String status;
  final String mealPlanName;
  final double mealPlanPrice;
  final String restaurantName;

  const SubscriptionModel({
    required this.id,
    required this.studentId,
    required this.mealPlanId,
    required this.restaurantId,
    required this.startDate,
    required this.contractedDays,
    required this.remainingDays,
    required this.status,
    this.mealPlanName = '',
    this.mealPlanPrice = 0,
    this.restaurantName = '',
  });

  factory SubscriptionModel.fromJson(Map<String, dynamic> json) => SubscriptionModel(
        id: json['id'] as String? ?? '',
        studentId: json['studentId'] as String? ?? '',
        mealPlanId: json['mealPlanId'] as String? ?? '',
        restaurantId: json['restaurantId'] as String? ?? '',
        startDate: json['startDate'] != null
            ? DateTime.parse(json['startDate'] as String)
            : DateTime.now(),
        contractedDays: json['contractedDays'] as int? ?? 0,
        remainingDays: json['remainingDays'] as int? ?? 0,
        status: json['status'] as String? ?? 'inactive',
        mealPlanName: json['mealPlan']?['name'] as String? ?? json['mealPlanName'] as String? ?? '',
        mealPlanPrice: (json['mealPlan']?['price'] as num?)?.toDouble() ?? 0,
        restaurantName: json['restaurant']?['name'] as String? ?? json['restaurantName'] as String? ?? '',
      );

  bool get isActive => status == 'active';
  double get progress => contractedDays > 0 ? remainingDays / contractedDays : 0;
}

class DailyMealModel {
  final String id;
  final String subscriptionId;
  final String studentId;
  final DateTime date;
  final String status;
  final String registeredBy;
  final String? validationMethod;

  const DailyMealModel({
    required this.id,
    required this.subscriptionId,
    required this.studentId,
    required this.date,
    required this.status,
    required this.registeredBy,
    this.validationMethod,
  });

  factory DailyMealModel.fromJson(Map<String, dynamic> json) => DailyMealModel(
        id: json['id'] as String? ?? '',
        subscriptionId: json['subscriptionId'] as String? ?? '',
        studentId: json['studentId'] as String? ?? '',
        date: json['date'] != null
            ? DateTime.parse(json['date'] as String)
            : DateTime.now(),
        status: json['status'] as String? ?? 'pending',
        registeredBy: json['registeredBy'] as String? ?? '',
        validationMethod: json['validationMethod'] as String?,
      );
}

class PaymentModel {
  final String id;
  final String subscriptionId;
  final String studentId;
  final String restaurantId;
  final double amount;
  final DateTime paymentDate;
  final String paymentMethod;
  final String? reference;

  const PaymentModel({
    required this.id,
    required this.subscriptionId,
    required this.studentId,
    required this.restaurantId,
    required this.amount,
    required this.paymentDate,
    required this.paymentMethod,
    this.reference,
  });

  factory PaymentModel.fromJson(Map<String, dynamic> json) => PaymentModel(
        id: json['id'] as String,
        subscriptionId: json['subscriptionId'] as String,
        studentId: json['studentId'] as String,
        restaurantId: json['restaurantId'] as String,
        amount: (json['amount'] as num).toDouble(),
        paymentDate: DateTime.parse(json['paymentDate'] as String),
        paymentMethod: json['paymentMethod'] as String,
        reference: json['reference'] as String?,
      );
}

class NotificationModel {
  final String id;
  final String userId;
  final String type;
  final String title;
  final String message;
  final bool isRead;
  final DateTime createdAt;

  const NotificationModel({
    required this.id,
    required this.userId,
    required this.type,
    required this.title,
    required this.message,
    required this.isRead,
    required this.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) => NotificationModel(
        id: json['id'] as String,
        userId: json['userId'] as String,
        type: json['type'] as String,
        title: json['title'] as String,
        message: json['message'] as String,
        isRead: json['isRead'] as bool? ?? false,
        createdAt: DateTime.parse(json['createdAt'] as String),
      );
}

class AdjustmentRequestModel {
  final String id;
  final String dailyMealId;
  final String requesterId;
  final String reason;
  final String status;
  final String? reviewerId;
  final String? resolution;
  final DateTime createdAt;
  final String requesterName;
  final DateTime? mealDate;

  const AdjustmentRequestModel({
    required this.id,
    required this.dailyMealId,
    required this.requesterId,
    required this.reason,
    required this.status,
    this.reviewerId,
    this.resolution,
    required this.createdAt,
    this.requesterName = '',
    this.mealDate,
  });

  factory AdjustmentRequestModel.fromJson(Map<String, dynamic> json) =>
      AdjustmentRequestModel(
        id: json['id'] as String,
        dailyMealId: json['dailyMealId'] as String,
        requesterId: json['requesterId'] as String,
        reason: json['reason'] as String,
        status: json['status'] as String,
        reviewerId: json['reviewerId'] as String?,
        resolution: json['resolution'] as String?,
        createdAt: DateTime.parse(json['createdAt'] as String),
        requesterName: json['requester']?['fullName'] as String? ?? '',
        mealDate: json['dailyMeal']?['date'] != null
            ? DateTime.parse(json['dailyMeal']['date'] as String)
            : null,
      );
}

class AuditLogModel {
  final String id;
  final String userId;
  final String action;
  final String entity;
  final String entityId;
  final Map<String, dynamic>? detail;
  final String? ipAddress;
  final DateTime createdAt;

  const AuditLogModel({
    required this.id,
    required this.userId,
    required this.action,
    required this.entity,
    required this.entityId,
    this.detail,
    this.ipAddress,
    required this.createdAt,
  });

  factory AuditLogModel.fromJson(Map<String, dynamic> json) => AuditLogModel(
        id: json['id'] as String,
        userId: json['userId'] as String,
        action: json['action'] as String,
        entity: json['entity'] as String,
        entityId: json['entityId'] as String,
        detail: json['detail'] as Map<String, dynamic>?,
        ipAddress: json['ipAddress'] as String?,
        createdAt: DateTime.parse(json['createdAt'] as String),
      );
}

class DashboardSummaryModel {
  final int totalStudents;
  final int todayConsumed;
  final int pendingAdjustments;
  final int activeSubscriptions;

  const DashboardSummaryModel({
    required this.totalStudents,
    required this.todayConsumed,
    required this.pendingAdjustments,
    required this.activeSubscriptions,
  });

  factory DashboardSummaryModel.fromJson(Map<String, dynamic> json) =>
      DashboardSummaryModel(
        totalStudents: json['totalStudents'] as int? ?? 0,
        todayConsumed: json['todayConsumed'] as int? ?? 0,
        pendingAdjustments: json['pendingAdjustments'] as int? ?? 0,
        activeSubscriptions: json['activeSubscriptions'] as int? ?? 0,
      );
}

class StudentDashboardModel {
  final SubscriptionModel? activeSubscription;
  final DailyMealModel? todayMeal;
  final int pendingNotifications;
  final List<DailyMealModel> recentMeals;

  const StudentDashboardModel({
    this.activeSubscription,
    this.todayMeal,
    this.pendingNotifications = 0,
    this.recentMeals = const [],
  });

  factory StudentDashboardModel.fromJson(Map<String, dynamic> json) =>
      StudentDashboardModel(
        activeSubscription: json['activeSubscription'] != null
            ? SubscriptionModel.fromJson(
                json['activeSubscription'] as Map<String, dynamic>)
            : null,
        todayMeal: json['todayMeal'] != null
            ? DailyMealModel.fromJson(
                json['todayMeal'] as Map<String, dynamic>)
            : null,
        pendingNotifications: json['pendingNotifications'] as int? ?? 0,
        recentMeals: (json['recentMeals'] as List<dynamic>?)
                ?.map((e) => DailyMealModel.fromJson(e as Map<String, dynamic>))
                .toList() ??
            [],
      );
}
