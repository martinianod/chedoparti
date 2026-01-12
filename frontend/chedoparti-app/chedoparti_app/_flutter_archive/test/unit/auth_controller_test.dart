import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:chedoparti_app/features/auth/presentation/controllers/auth_controller.dart';
import 'package:chedoparti_app/features/auth/data/auth_repository.dart';
import 'package:chedoparti_app/features/auth/data/models/user_model.dart';
// import 'package:mockito/mockito.dart'; // Add mockito if available, using manual mock for now

class MockAuthRepository extends AuthRepository {
  MockAuthRepository() : super(null as dynamic); // Passing null for DioClient

  @override
  Future<UserModel> login(String email, String password) async {
    if (email == 'error@test.com') throw Exception('Login Failed');
    return const UserModel(id: '1', email: 'test@test.com', name: 'Test User');
  }
}

void main() {
  test('AuthController login success updates state', () async {
    final container = ProviderContainer(
      overrides: [
        authRepositoryProvider.overrideWithValue(MockAuthRepository()),
      ],
    );

    final controller = container.read(authControllerProvider.notifier);

    await controller.login('test@test.com', 'pass');

    final state = container.read(authControllerProvider);
    expect(state.value, isNotNull);
    expect(state.value!.email, 'test@test.com');
  });
}
