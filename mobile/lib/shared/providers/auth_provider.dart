import 'package:flutter/foundation.dart';
import '../../core/network/api_client.dart';
import '../../core/network/api_exceptions.dart';
import '../../core/storage/local_storage.dart';
import '../../core/constants/app_constants.dart';

enum AuthStatus { unauthenticated, authenticating, authenticated }

class UserData {
  final String id;
  final String fullName;
  final String email;
  final String role;
  final String? restaurantId;
  final bool mustChangePassword;

  const UserData({
    required this.id,
    required this.fullName,
    required this.email,
    required this.role,
    this.restaurantId,
    this.mustChangePassword = false,
  });

  factory UserData.fromJson(Map<String, dynamic> json) => UserData(
        id: json['id'] as String,
        fullName: json['fullName'] as String,
        email: json['email'] as String,
        role: json['role'] as String,
        restaurantId: json['restaurantId'] as String?,
        mustChangePassword: json['mustChangePassword'] as bool? ?? false,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'fullName': fullName,
        'email': email,
        'role': role,
        'restaurantId': restaurantId,
        'mustChangePassword': mustChangePassword,
      };

  UserData copyWith({bool? mustChangePassword}) => UserData(
        id: id,
        fullName: fullName,
        email: email,
        role: role,
        restaurantId: restaurantId,
        mustChangePassword: mustChangePassword ?? this.mustChangePassword,
      );
}

class AuthProvider extends ChangeNotifier {
  final ApiClient _api;
  AuthStatus _status = AuthStatus.unauthenticated;
  UserData? _user;
  String? _token;

  AuthProvider(this._api);

  AuthStatus get status => _status;
  UserData? get user => _user;
  bool get isAuthenticated => _status == AuthStatus.authenticated;
  bool get isStudent => _user?.role == 'student';
  bool get isAdmin => _user?.role == 'admin';
  bool get isSuperadmin => _user?.role == 'superadmin';

  Future<void> tryAutoLogin() async {
    final storage = await LocalStorage.getInstance();
    final token = storage.getString(StorageKeys.accessToken);
    if (token == null) return;

    _api.setToken(token);
    _status = AuthStatus.authenticating;
    notifyListeners();

    try {
      final response = await _api.get(ApiConstants.me);
      final userData = response['data'] as Map<String, dynamic>;
      _user = UserData.fromJson(userData);
      _token = token;
      _status = AuthStatus.authenticated;
    } catch (_) {
      _api.setToken(null);
      await storage.remove(StorageKeys.accessToken);
      await storage.remove(StorageKeys.userData);
      _status = AuthStatus.unauthenticated;
    }
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    _status = AuthStatus.authenticating;
    notifyListeners();

    try {
      final response = await _api.post(ApiConstants.login, body: {
        'email': email,
        'password': password,
      });

      final data = response['data'] as Map<String, dynamic>;
      _token = data['accessToken'] as String;
      _user = UserData.fromJson(data['user'] as Map<String, dynamic>);

      _api.setToken(_token);

      final storage = await LocalStorage.getInstance();
      await storage.setString(StorageKeys.accessToken, _token!);
      await storage.setJson(StorageKeys.userData, _user!.toJson());

      _status = AuthStatus.authenticated;
    } catch (e) {
      _status = AuthStatus.unauthenticated;
      notifyListeners();
      if (e is ApiException) rethrow;
      throw ApiException(
        message: 'Error de conexión. Verifica tu red.',
        statusCode: 0,
        errorCode: 'NETWORK_ERROR',
      );
    }
    notifyListeners();
  }

  Future<void> changePassword(String currentPassword, String newPassword) async {
    await _api.patch(ApiConstants.changePassword, body: {
      'currentPassword': currentPassword,
      'newPassword': newPassword,
    });
    if (_user != null) {
      _user = _user!.copyWith(mustChangePassword: false);
      notifyListeners();
    }
  }

  Future<void> logout() async {
    try {
      await _api.post(ApiConstants.logout);
    } catch (_) {}

    _api.setToken(null);
    final storage = await LocalStorage.getInstance();
    await storage.remove(StorageKeys.accessToken);
    await storage.remove(StorageKeys.userData);
    _user = null;
    _token = null;
    _status = AuthStatus.unauthenticated;
    notifyListeners();
  }
}
