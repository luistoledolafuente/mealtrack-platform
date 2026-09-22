import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:mealtrack/core/network/api_client.dart';
import 'package:mealtrack/core/network/api_exceptions.dart';

void main() {
  group('ApiClient', () {
    test('get request succeeds with 200 response', () async {
      final client = MockClient((request) async {
        expect(request.headers['Content-Type'], equals('application/json'));
        return http.Response(
          jsonEncode({'success': true, 'data': {'id': '123'}}),
          200,
        );
      });

      final apiClient = ApiClient(client: client);
      final result = await apiClient.get('/auth/me');

      expect(result['success'], isTrue);
      expect(result['data']['id'], equals('123'));
    });

    test('includes Authorization header when token is set', () async {
      final client = MockClient((request) async {
        expect(request.headers['Authorization'], equals('Bearer test_token'));
        return http.Response(
          jsonEncode({'success': true, 'data': {}}),
          200,
        );
      });

      final apiClient = ApiClient(client: client);
      apiClient.setToken('test_token');
      await apiClient.get('/auth/me');
    });

    test('throws ApiException on error status code', () async {
      final client = MockClient((request) async {
        return http.Response(
          jsonEncode({
            'success': false,
            'message': 'No autorizado',
            'error': {'code': 'UNAUTHORIZED'},
          }),
          401,
        );
      });

      final apiClient = ApiClient(client: client);
      expect(
        () => apiClient.get('/auth/me'),
        throwsA(isA<ApiException>().having((e) => e.statusCode, 'statusCode', 401)),
      );
    });
  });
}
