import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../core/theme/colors.dart';

class BookingSlot extends StatelessWidget {
  final String time;
  final bool isAvailable;
  final bool isSelected;
  final VoidCallback onTap;

  const BookingSlot({
    super.key,
    required this.time,
    required this.isAvailable,
    this.isSelected = false,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final bgColor = isSelected
        ? AppColors.primary
        : isAvailable
            ? Colors.white
            : AppColors.booked;
    
    final textColor = isSelected
        ? Colors.white
        : isAvailable
            ? AppColors.textPrimaryLight
            : AppColors.textSecondaryLight;

    final borderColor = isSelected
        ? AppColors.primary
        : isAvailable
            ? AppColors.primary
            : Colors.transparent;

    return GestureDetector(
      onTap: isAvailable ? onTap : null,
      child: Container(
        padding: EdgeInsets.symmetric(vertical: 8.h, horizontal: 12.w),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(8.r),
          border: Border.all(color: borderColor),
        ),
        alignment: Alignment.center,
        child: Text(
          time,
          style: TextStyle(
            color: textColor,
            fontWeight: FontWeight.bold,
            fontSize: 14.sp,
          ),
        ),
      ),
    );
  }
}
