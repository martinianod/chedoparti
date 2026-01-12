import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_client.dart';
import 'models/user_model.dart';

class AuthRepository {
  final DioClient _dioClient;

  AuthRepository(this._dioClient);

  Future<UserModel> login(String email, String password) async {
    // START MOCK IMPLEMENTATION
    await Future.delayed(const Duration(seconds: 1)); // Simulate latency
    
    if (email == 'admin@admin.com') {
      return const UserModel(
        id: '1',
        email: 'admin@admin.com',
        name: 'Admin User',
        role: UserRole.admin,
        token: 'mock_jwt_admin',
      );
    }
    
    return UserModel(
      id: '2',
      email: email,
      name: 'John Doe',
      role: UserRole.user,
      token: 'mock_jwt_user',
    );
    // END MOCK IMPLEMENTATION

    // TODO: Real API Call
    // final response = await _dioClient.dio.post('/auth/login', data: {'email': email, 'password': password});
    // return UserModel.fromJson(response.data);
  }

  Future<UserModel> register(String name, String email, String password) async {
     await Future.delayed(const Duration(seconds: 1));
     return UserModel(
      id: '3',
      email: email,
      name: name,
      role: UserRole.user,
      token: 'mock_jwt_new_user',
    );
  }

  Future<void> logout() async {
    await Future.delayed(const Duration(milliseconds: 500));
  }
}

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final dioClient = ref.read(dioClientProvider);
  return AuthRepository(DioClient()); // Creating new instance or use provider logic
});
