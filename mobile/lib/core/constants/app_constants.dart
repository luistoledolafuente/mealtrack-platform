class AppConstants {
  AppConstants._();

  static const String appName = 'MealTrack';
  static const String appVersion = '0.1.0';
}

class ApiConstants {
  ApiConstants._();

  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:3000/api/v1',
  );

  // Auth
  static const String login = '/auth/login';
  static const String logout = '/auth/logout';
  static const String me = '/auth/me';

  // Users
  static const String userProfile = '/users/me';
  static const String changePassword = '/users/me/password';
  static const String createUser = '/users';

  // Restaurants
  static const String restaurants = '/restaurants';

  // Meal plans
  static const String mealPlans = '/meal-plans';

  // Subscriptions
  static const String subscriptions = '/subscriptions';

  // Daily meals
  static const String dailyMeals = '/daily-meals';

  // Adjustment requests
  static const String adjustmentRequests = '/adjustment-requests';

  // Payments
  static const String payments = '/payments';

  // Dashboards
  static const String studentDashboard = '/dashboards/student';
  static const String adminDashboard = '/dashboards/admin';
  static const String superadminDashboard = '/dashboards/superadmin';

  // Notifications
  static const String notifications = '/notifications';

  // Audit
  static const String auditLogs = '/audit-logs';

  // QR
  static const String qrIssue = '/qr/issue';
  static const String qrValidate = '/qr/validate';
}

class StorageKeys {
  StorageKeys._();

  static const String accessToken = 'access_token';
  static const String userData = 'user_data';
  static const String syncQueue = 'sync_queue';
}
