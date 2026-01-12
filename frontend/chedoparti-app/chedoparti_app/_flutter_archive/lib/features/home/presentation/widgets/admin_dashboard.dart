import 'package:flutter/material.dart';

class AdminDashboard extends StatelessWidget {
  const AdminDashboard({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        ElevatedButton(
          onPressed: () {
            Navigator.pushNamed(context, '/courts');
          },
          child: const Text('Gestionar Canchas'),
        ),
        const SizedBox(height: 16),
        ElevatedButton(
          onPressed: () {
            Navigator.pushNamed(context, '/reservations');
          },
          child: const Text('Gestionar Reservas'),
        ),
        const SizedBox(height: 16),
        ElevatedButton(
          onPressed: () {
            Navigator.pushNamed(context, '/tournaments');
          },
          child: const Text('Gestionar Torneos'),
        ),
        const SizedBox(height: 16),
        ElevatedButton(
          onPressed: () {
            Navigator.pushNamed(context, '/players');
          },
          child: const Text('Gestionar Jugadores'),
        ),
      ],
    );
  }
}
