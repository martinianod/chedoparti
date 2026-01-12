// TODO Implement this library.
import 'package:chedoparti_app/features/auth/providers/user_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ProfilePage extends ConsumerWidget {
  const ProfilePage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(userProvider);

    if (user == null) {
      return const Scaffold(
        body: Center(child: Text('No hay usuario logueado')),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Perfil')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            if (user.avatarUrl != null)
              CircleAvatar(
                radius: 50,
                backgroundImage: NetworkImage(user.avatarUrl!),
              )
            else
              const CircleAvatar(
                radius: 50,
                child: Icon(Icons.person, size: 50),
              ),
            const SizedBox(height: 16),
            Text(user.firstname, style: const TextStyle(fontSize: 24)),
            const SizedBox(height: 8),
            Text(user.email, style: const TextStyle(color: Colors.grey)),
            const SizedBox(height: 8),
            Chip(
                label:
                    Text(user.role == 'admin' ? 'Administrador' : 'Jugador')),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                // TODO: implementar logout
              },
              child: const Text('Cerrar sesión'),
            ),
          ],
        ),
      ),
    );
  }
}
