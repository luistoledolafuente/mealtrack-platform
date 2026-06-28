class ApiException implements Exception {
  final String message;
  final int statusCode;
  final String errorCode;

  ApiException({
    required this.message,
    required this.statusCode,
    required this.errorCode,
  });

  @override
  String toString() => 'ApiException($statusCode): $errorCode - $message';
}
