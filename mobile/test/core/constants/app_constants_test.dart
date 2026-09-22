import 'package:flutter_test/flutter_test.dart';
import 'package:mealtrack/core/constants/app_constants.dart';

void main() {
  group('ApiConstants', () {
    test('baseUrl returns environment or default url', () {
      expect(ApiConstants.baseUrl, isNotEmpty);
      expect(ApiConstants.baseUrl, contains('/api/v1'));
    });

    test('endpoint paths have correct format', () {
      expect(ApiConstants.login, equals('/auth/login'));
      expect(ApiConstants.logout, equals('/auth/logout'));
      expect(ApiConstants.me, equals('/auth/me'));
      expect(ApiConstants.dailyMeals, equals('/daily-meals'));
      expect(ApiConstants.subscriptions, equals('/subscriptions'));
    });
  });
}
