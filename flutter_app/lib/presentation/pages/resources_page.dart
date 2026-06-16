import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';

class ResourcesPage extends StatelessWidget {
  const ResourcesPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Resources')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildCrisisSection(),
          const SizedBox(height: 24),
          _buildEducationalSection(),
        ],
      ),
    );
  }

  Widget _buildCrisisSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Crisis Support', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.red)),
        const SizedBox(height: 12),
        _buildResourceCard('Mental Health Uganda', '0800 21 21 21', LucideIcons.phone),
        _buildResourceCard('Befrienders Kenya', '+254 722 178 177', LucideIcons.phone),
      ],
    );
  }

  Widget _buildResourceCard(String title, String subtitle, IconData icon) {
    return Card(
      child: ListTile(
        leading: Icon(icon, color: Colors.blue),
        title: Text(title),
        subtitle: Text(subtitle),
        trailing: const Icon(LucideIcons.externalLink),
      ),
    );
  }

  Widget _buildEducationalSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Educational Content', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        _buildResourceCard('Understanding Pilot Stress', '8 min read', LucideIcons.bookOpen),
        _buildResourceCard('Sleep Hygiene for Pilots', '6 min read', LucideIcons.bookOpen),
      ],
    );
  }
}
