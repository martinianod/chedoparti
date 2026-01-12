import 'package:flutter/material.dart';

class AppColors {
  // Primary Brand Colors (Playtomic/Sports Vibe)
  static const Color primary = Color(0xFF0055FF); // Electric Blue
  static const Color primaryVariant = Color(0xFF0033CC);
  static const Color secondary = Color(0xFF00C853); // Success/Available Green
  
  // Airbnb/Calendly Inspired Neutrals
  static const Color backgroundLight = Color(0xFFFFFFFF);
  static const Color surfaceLight = Color(0xFFFFFFFF);
  static const Color backgroundDark = Color(0xFF121212);
  static const Color surfaceDark = Color(0xFF1E1E1E); // Card color in dark mode
  
  // Text Colors
  static const Color textPrimaryLight = Color(0xFF222222); // Airbnb Black
  static const Color textSecondaryLight = Color(0xFF717171); // Airbnb Grey
  static const Color textPrimaryDark = Color(0xFFEEEEEE);
  static const Color textSecondaryDark = Color(0xFFB0B0B0);

  // Status Colors (Uber Style)
  static const Color success = Color(0xFF00C853);
  static const Color error = Color(0xFFD32F2F);
  static const Color warning = Color(0xFFFFA000);
  static const Color info = Color(0xFF1976D2);
  
  // Booking Status
  static const Color available = Color(0xFF00C853);
  static const Color booked = Color(0xFFE0E0E0); // Disabled look
  static const Color selected = primary;
  static const Color maintenance = Color(0xFFFAFAFA); // Striped normally, handled in UI
  
  // Shimmer / Loading
  static const Color shimmerBase = Color(0xFFE0E0E0);
  static const Color shimmerHighlight = Color(0xFFF5F5F5);

  static const Color divider = Color(0xFFEEEEEE);
}
