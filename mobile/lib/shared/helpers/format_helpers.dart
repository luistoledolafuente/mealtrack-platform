import 'package:intl/intl.dart';

class FormatHelpers {
  FormatHelpers._();

  static String currency(double amount) {
    final formatter = NumberFormat.currency(decimalDigits: 2, symbol: 'S/ ');
    return formatter.format(amount);
  }

  static String days(int count) {
    return count == 1 ? '$count día' : '$count días';
  }

  static String capitalize(String text) {
    if (text.isEmpty) return text;
    return text[0].toUpperCase() + text.substring(1).toLowerCase();
  }

  static String roleLabel(String role) {
    switch (role) {
      case 'student':
        return 'Estudiante';
      case 'admin':
        return 'Admin';
      case 'superadmin':
        return 'Superadmin';
      default:
        return capitalize(role);
    }
  }
}
