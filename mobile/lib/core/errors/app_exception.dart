class AppException implements Exception {
  final String message;
  final String code;

  AppException({required this.message, this.code = 'UNKNOWN'});

  @override
  String toString() => 'AppException($code): $message';
}

class NetworkException extends AppException {
  NetworkException({required super.message, super.code = 'NETWORK_ERROR'});
}

class AuthException extends AppException {
  AuthException({required super.message, super.code = 'AUTH_ERROR'});
}

class CacheException extends AppException {
  CacheException({required super.message, super.code = 'CACHE_ERROR'});
}
