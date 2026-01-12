// TODO Implement this library.
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class DashboardPage extends StatelessWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Dashboard')),
      body: ListView(
        children: [
          ListTile(
            title: const Text('Canchas'),
            onTap: () => context.go('/courts'),
          ),
          ListTile(
            title: const Text('Reservas'),
            onTap: () => context.go('/reservations'),
          ),
          ListTile(
            title: const Text('Torneos'),
            onTap: () => context.go('/tournaments'),
          ),
          ListTile(
            title: const Text('Rankings'),
            onTap: () => context.go('/rankings'),
          ),
          ListTile(
            title: const Text('Perfil'),
            onTap: () => context.go('/profile'),
          ),
        ],
      ),
    );
  }
}
