import 'package:flutter/material.dart';

class ReservePage extends StatelessWidget {
  const ReservePage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Reservar Cancha')),
      body: const Center(child: Text('Reservar una Cancha')),
    );
  }
}
