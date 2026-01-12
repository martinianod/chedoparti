import 'package:flutter/material.dart';

class RankingsPage extends StatelessWidget {
  const RankingsPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Rankings y Torneos')),
      body: const Center(child: Text('Ver Rankings y Torneos')),
    );
  }
}
