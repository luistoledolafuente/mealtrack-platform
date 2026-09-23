import 'package:flutter/material.dart';
import 'app_colors.dart';

class AppTheme {
  AppTheme._();

  static ThemeData get light => _build(Brightness.light);

  static ThemeData get dark => _build(Brightness.dark);

  static ThemeData _build(Brightness brightness) {
    final isDark = brightness == Brightness.dark;
    final scheme = ColorScheme.fromSeed(
      seedColor: AppColors.primarySeed,
      brightness: brightness,
    ).copyWith(
      primary: isDark ? const Color(0xFFFFB4A0) : AppColors.primary,
      onPrimary: isDark ? const Color(0xFF5A1806) : Colors.white,
      secondary: isDark ? const Color(0xFFFFB5A0) : AppColors.secondary,
      tertiary: isDark ? const Color(0xFF6EE7B7) : AppColors.accent,
      error: AppColors.error,
      surface: isDark ? const Color(0xFF17120F) : AppColors.surface,
      surfaceContainerHighest:
          isDark ? const Color(0xFF2A211E) : AppColors.muted,
      outlineVariant: isDark ? const Color(0xFF51433E) : AppColors.border,
    );
    final base =
        ThemeData(brightness: brightness, useMaterial3: true).textTheme;

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      colorScheme: scheme,
      scaffoldBackgroundColor:
          isDark ? const Color(0xFF17120F) : AppColors.background,
      textTheme: base.copyWith(
        displaySmall: base.displaySmall
            ?.copyWith(fontWeight: FontWeight.w700, letterSpacing: -0.8),
        headlineMedium: base.headlineMedium
            ?.copyWith(fontWeight: FontWeight.w700, letterSpacing: -0.5),
        titleLarge: base.titleLarge?.copyWith(fontWeight: FontWeight.w700),
        titleMedium: base.titleMedium?.copyWith(fontWeight: FontWeight.w700),
        bodyLarge: base.bodyLarge?.copyWith(height: 1.5),
        bodyMedium: base.bodyMedium?.copyWith(height: 1.45),
        labelLarge: base.labelLarge?.copyWith(fontWeight: FontWeight.w700),
      ),
      appBarTheme: AppBarTheme(
        centerTitle: false,
        elevation: 0,
        scrolledUnderElevation: 0,
        backgroundColor: Colors.transparent,
        foregroundColor: scheme.onSurface,
        surfaceTintColor: Colors.transparent,
        titleTextStyle: base.titleLarge
            ?.copyWith(color: scheme.onSurface, fontWeight: FontWeight.w700),
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        margin: EdgeInsets.zero,
        color: scheme.surface,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(color: scheme.outlineVariant),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: scheme.surface,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 17),
        border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide(color: scheme.outlineVariant)),
        enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide(color: scheme.outlineVariant)),
        focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide(color: scheme.primary, width: 2)),
        errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide(color: scheme.error)),
        focusedErrorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide(color: scheme.error, width: 2)),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size.fromHeight(52),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          minimumSize: const Size.fromHeight(48),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          side: BorderSide(color: scheme.outlineVariant),
        ),
      ),
      chipTheme: ChipThemeData(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
        side: BorderSide(color: scheme.outlineVariant),
      ),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
      dividerTheme: DividerThemeData(color: scheme.outlineVariant, space: 1),
      pageTransitionsTheme: const PageTransitionsTheme(
        builders: {
          TargetPlatform.android: FadeUpwardsPageTransitionsBuilder(),
          TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
        },
      ),
    );
  }
}
