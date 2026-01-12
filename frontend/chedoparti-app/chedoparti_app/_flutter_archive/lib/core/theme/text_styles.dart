import 'package:flutter/material.dart';
import 'colors.dart';
import 'fonts.dart';

class AppTextStyles {
  static const title = TextStyle(
    fontFamily: AppFonts.primaryFont,
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: AppColors.navy,
  );

  static const subtitle = TextStyle(
    fontFamily: AppFonts.secondaryFont,
    fontSize: 20,
    fontWeight: FontWeight.w500,
    color: AppColors.blue,
  );

  static const body = TextStyle(
    fontFamily: AppFonts.secondaryFont,
    fontSize: 16,
    color: AppColors.gray,
  );
}
