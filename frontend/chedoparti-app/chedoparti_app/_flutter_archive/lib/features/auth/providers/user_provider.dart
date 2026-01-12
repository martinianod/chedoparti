import 'package:chedoparti_app/features/auth/data/models/user_model.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Provider que guarda el usuario logueado
final userProvider = StateProvider<UserModel?>((ref) => null);
