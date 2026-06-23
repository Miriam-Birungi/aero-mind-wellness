import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'dart:async';

class VideoConsultationDialog extends StatefulWidget {
  const VideoConsultationDialog({super.key});

  @override
  State<VideoConsultationDialog> createState() => _VideoConsultationDialogState();
}

class _VideoConsultationDialogState extends State<VideoConsultationDialog> {
  int _seconds = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() => _seconds++);
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String _formatTime(int totalSeconds) {
    int mins = totalSeconds ~/ 60;
    int secs = totalSeconds % 60;
    return '${mins.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // "Main" Video
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const CircleAvatar(radius: 60, backgroundColor: Colors.white24, child: Icon(LucideIcons.user, size: 60, color: Colors.white)),
                const SizedBox(height: 24),
                const Text('Dr. Sarah Johnson', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                const Text('Aviation Medical Specialist', style: TextStyle(color: Colors.white70)),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(width: 8, height: 8, decoration: const BoxDecoration(color: Colors.green, shape: BoxShape.circle)),
                    const SizedBox(width: 8),
                    const Text('Connected', style: TextStyle(color: Colors.white, fontSize: 12)),
                  ],
                ),
              ],
            ),
          ),

          // Header
          Positioned(
            top: 40,
            left: 20,
            right: 20,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(_formatTime(_seconds), style: const TextStyle(color: Colors.white, fontSize: 18, fontFeatures: [FontFeature.tabularFigures()])),
                IconButton(onPressed: () => Navigator.pop(context), icon: const Icon(LucideIcons.x, color: Colors.white)),
              ],
            ),
          ),

          // "Self" Video
          Positioned(
            top: 100,
            right: 20,
            child: Container(
              width: 100,
              height: 150,
              decoration: BoxDecoration(color: Colors.white10, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.white24)),
              child: const Center(child: Icon(LucideIcons.user, color: Colors.white24)),
            ),
          ),

          // Controls
          Positioned(
            bottom: 40,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _buildCircleBtn(LucideIcons.mic, Colors.white24),
                const SizedBox(width: 20),
                _buildCircleBtn(LucideIcons.video, Colors.white24),
                const SizedBox(width: 20),
                _buildCircleBtn(LucideIcons.phoneOff, Colors.red, onPressed: () => Navigator.pop(context)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCircleBtn(IconData icon, Color color, {VoidCallback? onPressed}) {
    return Container(
      width: 60,
      height: 60,
      decoration: BoxDecoration(color: color, shape: BoxShape.circle),
      child: IconButton(onPressed: onPressed, icon: Icon(icon, color: Colors.white)),
    );
  }
}
