import 'package:chedoparti_app/features/auth/presentation/pages/login_page.dart';
import 'package:chedoparti_app/features/auth/providers/user_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class AuthGuard extends ConsumerWidget {
  final Widget child;

  const AuthGuard({Key? key, required this.child}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(userProvider);

    if (user == null) {
      // No logueado => redirigir al Login
      return const LoginPage();
    } else {
      // Logueado => mostrar la pantalla protegida
      return child;
    }
  }
}
