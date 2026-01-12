import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../network/dio_client.dart';
import '../routes/app_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

// Future provider for SharedPreferences
final sharedPreferencesProvider = FutureProvider<SharedPreferences>((ref) async {
  return await SharedPreferences.getInstance();
});

// All global providers can be aggregated here or just exported
// This file serves as a central point for DI concepts
