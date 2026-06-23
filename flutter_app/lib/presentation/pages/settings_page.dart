import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:aero_mind_wellness/logic/blocs/auth_bloc.dart' as app_auth;
import '../widgets/video_consultation.dart';

class SettingsPage extends StatelessWidget {
  const SettingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: BlocBuilder<app_auth.AuthBloc, app_auth.AuthState>(
        builder: (context, state) {
          if (state is app_auth.AuthAuthenticated) {
            final user = state.user;
            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _buildProfileCard(user),
                const SizedBox(height: 24),
                const Text('Simulation Tools', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey)),
                const Divider(),
                ListTile(
                  leading: const Icon(LucideIcons.video, color: Colors.blue),
                  title: const Text('Start Video Consultation'),
                  subtitle: const Text('Simulate a secure session with a specialist'),
                  onTap: () => _showVideoCall(context),
                ),
                const SizedBox(height: 24),
                const Text('Account', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey)),
                const Divider(),
                ListTile(
                  leading: const Icon(LucideIcons.logOut, color: Colors.red),
                  title: const Text('Logout'),
                  onTap: () => context.read<app_auth.AuthBloc>().add(app_auth.AuthLogoutRequested()),
                ),
              ],
            );
          }
          return const Center(child: CircularProgressIndicator());
        },
      ),
    );
  }

  Widget _buildProfileCard(user) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            const CircleAvatar(radius: 40, child: Icon(LucideIcons.user, size: 40)),
            const SizedBox(height: 16),
            Text(user.name, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            Text(user.email, style: const TextStyle(color: Colors.grey)),
            const SizedBox(height: 8),
            Chip(label: Text('Worker ID: ${user.workerId}')),
          ],
        ),
      ),
    );
  }

  void _showVideoCall(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const VideoConsultationDialog(),
    );
  }
}
