import 'package:chedoparti_app/features/auth/providers/user_provider.dart';
import 'package:chedoparti_app/features/home/presentation/widgets/admin_dashboard.dart';
import 'package:chedoparti_app/features/home/presentation/widgets/player_dashboard.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class HomePage extends ConsumerWidget {
  const HomePage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(userProvider);

    if (user == null) {
      return const Scaffold(
        body: Center(
          child: Text('Usuario no logueado.'),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Inicio'),
      ),
      body: user.role.name.isEmpty
          ? const AdminDashboard()
          : const PlayerDashboard(),
    );
  }
}
