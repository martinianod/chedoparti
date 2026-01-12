import 'package:flutter/material.dart';

class PlayerDashboard extends StatelessWidget {
  const PlayerDashboard({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        ElevatedButton(
          onPressed: () {
            Navigator.pushNamed(context, '/reserve');
          },
          child: const Text('Reservar una Cancha'),
        ),
        const SizedBox(height: 16),
        ElevatedButton(
          onPressed: () {
            Navigator.pushNamed(context, '/my_reservations');
          },
          child: const Text('Mis Reservas'),
        ),
        const SizedBox(height: 16),
        ElevatedButton(
          onPressed: () {
            Navigator.pushNamed(context, '/rankings');
          },
          child: const Text('Ver Rankings y Torneos'),
        ),
      ],
    );
  }
}
