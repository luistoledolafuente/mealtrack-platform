import 'package:flutter/foundation.dart';
import '../../core/storage/local_storage.dart';
import '../../core/constants/app_constants.dart';

// TODO: Implement full auth provider
// - login with email + password
// - logout
// - token persistence
// - role-based navigation
// - session restore on app start

enum AuthStatus { unauthenticated, authenticating, authenticated }

class AuthProvider extends ChangeNotifier {
  AuthStatus _status = AuthStatus.unauthenticated;
  Map<String, dynamic>? _user;

  AuthStatus get status => _status;
  Map<String, dynamic>? get user => _user;
  bool get isAuthenticated => _status == AuthStatus.authenticated;

  Future<void> tryAutoLogin() async {
    // TODO: Check stored token and validate with backend
    final storage = await LocalStorage.getInstance();
    final token = storage.getString(StorageKeys.accessToken);
    if (token != null) {
      _user = storage.getJson(StorageKeys.userData);
      _status = AuthStatus.authenticated;
      notifyListeners();
    }
  }

  Future<void> login(String email, String password) async {
    // TODO: Implement login
    _status = AuthStatus.authenticating;
    notifyListeners();

    try {
      // Call API
      // Save token and user
      _status = AuthStatus.authenticated;
      notifyListeners();
    } catch (e) {
      _status = AuthStatus.unauthenticated;
      notifyListeners();
      rethrow;
    }
  }

  Future<void> logout() async {
    final storage = await LocalStorage.getInstance();
    await storage.remove(StorageKeys.accessToken);
    await storage.remove(StorageKeys.userData);
    _user = null;
    _status = AuthStatus.unauthenticated;
    notifyListeners();
  }
}
