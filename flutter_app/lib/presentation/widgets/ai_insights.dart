import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';

class AIInsightsWidget extends StatelessWidget {
  final List<dynamic> insights;
  const AIInsightsWidget({super.key, required this.insights});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      color: Colors.blue[50],
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(LucideIcons.sparkles, size: 18, color: Colors.blue),
                SizedBox(width: 8),
                Text('AI Wellness Insights', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 12),
            ...insights.map((insight) => Padding(
              padding: const EdgeInsets.only(bottom: 8.0),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('• ', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.blue)),
                  Expanded(child: Text(insight, style: const TextStyle(fontSize: 13))),
                ],
              ),
            )),
          ],
        ),
      ),
    );
  }
}
