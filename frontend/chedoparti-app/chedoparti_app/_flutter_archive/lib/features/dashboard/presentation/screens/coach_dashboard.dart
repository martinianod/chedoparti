import 'package:flutter/material.dart';
import '../../../../core/theme/colors.dart';

class CoachDashboard extends StatefulWidget {
  const CoachDashboard({super.key});

  @override
  State<CoachDashboard> createState() => _CoachDashboardState();
}

class _CoachDashboardState extends State<CoachDashboard> {
  // Mock Data
  final List<String> _unscheduledGroups = ['Grupo A (Principiante)', 'Grupo B (Intermedio)', 'Clase Particular Juan'];
  final Map<String, String?> _schedule = {
    '09:00': null,
    '10:00': null,
    '11:00': null,
    '16:00': null,
    '17:00': null,
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Panel Entrenador'),
        actions: [
          IconButton(onPressed: () {}, icon: const Icon(Icons.notifications)),
          const CircleAvatar(
             backgroundImage: NetworkImage('https://i.pravatar.cc/150?img=12'), // Mock avatar
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: Row(
        children: [
          // Left Panel: Draggable Groups
          Expanded(
            flex: 2,
            child: Container(
              color: AppColors.backgroundLight,
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                   const Text('Mis Grupos', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                   const SizedBox(height: 16),
                   ..._unscheduledGroups.map((group) => Draggable<String>(
                     data: group,
                     feedback: Material(
                       elevation: 4,
                       borderRadius: BorderRadius.circular(8),
                       child: Container(
                         padding: const EdgeInsets.all(12),
                         decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(8)),
                         child: Text(group, style: const TextStyle(color: Colors.white)),
                       ),
                     ),
                     childWhenDragging: Opacity(
                       opacity: 0.5,
                       child: _buildGroupCard(group),
                     ),
                     child: _buildGroupCard(group),
                   )),
                ],
              ),
            ),
          ),
          const VerticalDivider(width: 1),
          // Right Panel: Schedule Slots (DragTargets)
          Expanded(
            flex: 3,
            child: Container(
              color: Colors.white,
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Mi Agenda (Hoy)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                  const SizedBox(height: 16),
                  Expanded(
                    child: ListView(
                      children: _schedule.entries.map((entry) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: Row(
                            children: [
                              SizedBox(width: 60, child: Text(entry.key, style: const TextStyle(fontWeight: FontWeight.bold))),
                              Expanded(
                                child: DragTarget<String>(
                                  onAccept: (data) {
                                    setState(() {
                                      _schedule[entry.key] = data;
                                      _unscheduledGroups.remove(data);
                                    });
                                  },
                                  builder: (context, candidates, rejects) {
                                    final isFilled = entry.value != null;
                                    return Container(
                                      height: 60,
                                      decoration: BoxDecoration(
                                        color: isFilled ? AppColors.secondary.withOpacity(0.1) : Colors.grey.shade50,
                                        border: Border.all(
                                          color: candidates.isNotEmpty ? AppColors.primary : (isFilled ? AppColors.secondary : Colors.grey.shade300),
                                          width: candidates.isNotEmpty ? 2 : 1,
                                        ),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      alignment: Alignment.centerLeft,
                                      padding: const EdgeInsets.symmetric(horizontal: 16),
                                      child: isFilled
                                          ? Row(
                                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                              children: [
                                                Text(entry.value!, style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.textPrimaryLight)),
                                                IconButton(
                                                  icon: const Icon(Icons.close, size: 18),
                                                  onPressed: () {
                                                    setState(() {
                                                      _unscheduledGroups.add(entry.value!);
                                                      _schedule[entry.key] = null;
                                                    });
                                                  },
                                                )
                                              ],
                                            )
                                          : Text(
                                              candidates.isNotEmpty ? 'Soltar aquí' : 'Disponible',
                                              style: TextStyle(color: candidates.isNotEmpty ? AppColors.primary : Colors.grey),
                                            ),
                                    );
                                  },
                                ),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGroupCard(String group) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF9F9F9),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          const Icon(Icons.drag_indicator, color: Colors.grey),
          const SizedBox(width: 8),
          Expanded(child: Text(group)),
        ],
      ),
    );
  }
}
