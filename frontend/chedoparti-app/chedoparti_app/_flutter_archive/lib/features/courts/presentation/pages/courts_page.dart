import 'package:flutter/material.dart';

class CourtsPage extends StatelessWidget {
  const CourtsPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Canchas')),
      body: const Center(child: Text('Gestión de Canchas')),
    );
  }
}
