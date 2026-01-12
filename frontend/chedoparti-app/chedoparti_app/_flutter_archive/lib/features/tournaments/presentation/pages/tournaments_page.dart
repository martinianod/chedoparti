import 'package:flutter/material.dart';

class TournamentsPage extends StatelessWidget {
  const TournamentsPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Torneos')),
      body: const Center(child: Text('Gestión de Torneos')),
    );
  }
}
