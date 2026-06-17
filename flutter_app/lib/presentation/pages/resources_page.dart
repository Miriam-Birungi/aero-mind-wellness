import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:google_fonts/google_fonts.dart';

class ResourcesPage extends StatefulWidget {
  const ResourcesPage({super.key});

  @override
  State<ResourcesPage> createState() => _ResourcesPageState();
}

class _ResourcesPageState extends State<ResourcesPage> {
  final List<Map<String, dynamic>> _crisisResources = [
    { 'title': 'Mental Health Uganda', 'phone': '0800 21 21 21', 'country': 'Uganda', 'description': '24/7 confidential counseling' },
    { 'title': 'StrongMinds Uganda', 'phone': '+256 800 200 600', 'country': 'Uganda', 'description': 'Mental health support' },
    { 'title': 'Befrienders Kenya', 'phone': '+254 722 178 177', 'country': 'Kenya', 'description': 'Emotional support' }
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Crisis Resources'),
        backgroundColor: const Color(0xFF2563EB),
        foregroundColor: Colors.white,
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _crisisResources.length,
        itemBuilder: (context, index) {
          final res = _crisisResources[index];
          return Card(
            margin: const EdgeInsets.only(bottom: 16),
            child: ListTile(
              title: Text(res['title'], style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(res['description']),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(LucideIcons.phone, size: 14, color: Colors.green),
                      const SizedBox(width: 4),
                      Text(res['phone'], style: const TextStyle(color: Colors.green, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ],
              ),
              trailing: Text(res['country'], style: const TextStyle(fontSize: 10, color: Colors.grey)),
            ),
          );
        },
      ),
    );
  }
}
