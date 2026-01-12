import 'package:flutter/material.dart';

class THelperFunctions {
  static isDarkModo(BuildContext context) {
    return Theme.of(context).brightness == Brightness.dark;
  }
}
