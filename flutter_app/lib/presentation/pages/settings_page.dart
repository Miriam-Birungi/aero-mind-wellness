import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../logic/blocs/auth_bloc.dart';
import '../widgets/video_consultation.dart';

class SettingsPage extends StatelessWidget {
  const SettingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Medical Contact', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          Card(
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(LucideIcons.video, color: Colors.blue),
                  title: const Text('Video Consultation'),
                  subtitle: const Text('Connect with a flight surgeon'),
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const VideoConsultationDialog())),
                ),
                const Divider(height: 0),
                ListTile(
                  leading: const Icon(LucideIcons.phone, color: Colors.green),
                  title: const Text('Emergency Call'),
                  onTap: () {},
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          const Text('App Preferences', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          Card(
            child: Column(
              children: [
                SwitchListTile(title: const Text('Push Notifications'), value: true, onChanged: (v) {}),
                const Divider(height: 0),
                SwitchListTile(title: const Text('Data Sharing'), value: false, onChanged: (v) {}),
              ],
            ),
          ),
          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () => context.read<AuthBloc>().add(AuthLogoutRequested()),
              style: OutlinedButton.styleFrom(foregroundColor: Colors.red, side: const BorderSide(color: Colors.red)),
              child: const Text('Logout'),
            ),
          ),
        ],
      ),
    );
  }
}
