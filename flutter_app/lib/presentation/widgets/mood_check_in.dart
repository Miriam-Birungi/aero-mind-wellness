import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';

class MoodCheckIn extends StatefulWidget {
  final Function(int) onMoodSubmit;
  const MoodCheckIn({super.key, required this.onMoodSubmit});

  @override
  State<MoodCheckIn> createState() => _MoodCheckInState();
}

class _MoodCheckInState extends State<MoodCheckIn> {
  double _mood = 5;
  bool _submitted = false;

  final List<String> _emojis = ["😫", "😟", "😐", "🙂", "😊"];

  String _getEmoji(double value) {
    if (value <= 2) return _emojis[0];
    if (value <= 4) return _emojis[1];
    if (value <= 6) return _emojis[2];
    if (value <= 8) return _emojis[3];
    return _emojis[4];
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            const Text('How are you feeling today?', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            Text(_getEmoji(_mood), style: const TextStyle(fontSize: 48)),
            Slider(
              value: _mood,
              min: 1,
              max: 10,
              divisions: 9,
              onChanged: _submitted ? null : (v) => setState(() => _mood = v),
            ),
            const Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Stressed', style: TextStyle(fontSize: 10, color: Colors.grey)),
                Text('Excellent', style: TextStyle(fontSize: 10, color: Colors.grey)),
              ],
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _submitted ? null : () {
                  widget.onMoodSubmit(_mood.toInt());
                  setState(() => _submitted = true);
                  Future.delayed(const Duration(seconds: 2), () {
                    if (mounted) setState(() => _submitted = false);
                  });
                },
                child: Text(_submitted ? 'Recorded ✓' : 'Submit Mood'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
