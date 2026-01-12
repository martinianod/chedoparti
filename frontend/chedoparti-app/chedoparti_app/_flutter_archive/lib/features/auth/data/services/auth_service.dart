import 'package:chedoparti_app/core/constants/enums.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user_model.dart';

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService();
});

class AuthService {
  // Simulamos una base de datos de usuarios
  final List<UserModel> _fakeDatabase = [];

  static var instance;

  Future<UserModel?> login(String email, String password) async {
    await Future.delayed(const Duration(seconds: 1));
    try {
      return _fakeDatabase.firstWhere((u) => u.email == email);
    } catch (e) {
      return null;
    }
  }

  Future<UserModel> register(
      String email, String firstname, String lastname, String role) async {
    await Future.delayed(const Duration(seconds: 1));
    final newUser = UserModel(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      email: email,
      firstname: firstname,
      role: AppRole.user,
      avatarUrl: null,
      lastname: lastname,
    );
    _fakeDatabase.add(newUser);
    return newUser;
  }
}
