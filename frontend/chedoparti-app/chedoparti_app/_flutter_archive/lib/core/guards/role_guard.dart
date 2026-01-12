import 'package:chedoparti_app/features/auth/data/services/auth_service.dart';
import 'package:chedoparti_app/features/home/presentation/pages/home_page.dart';
import 'package:flutter/material.dart';

class RoleGuard extends StatelessWidget {
  final String allowedRole;
  final Widget child;

  const RoleGuard({required this.allowedRole, required this.child, Key? key})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    final currentUser = AuthService.instance.currentUser;

    if (currentUser == null || currentUser.role != allowedRole) {
      // No tiene el rol correcto
      return const HomePage();
    }

    return child;
  }
}
