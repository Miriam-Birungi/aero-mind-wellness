import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'dart:async';

class BreathingExercisePage extends StatefulWidget {
  const BreathingExercisePage({super.key});

  @override
  State<BreathingExercisePage> createState() => _BreathingExercisePageState();
}

class _BreathingExercisePageState extends State<BreathingExercisePage> {
  String _phase = 'Inhale';
  int _counter = 4;
  bool _isActive = false;
  Timer? _timer;

  void _start() {
    setState(() => _isActive = true);
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        if (_counter > 1) {
          _counter--;
        } else {
          if (_phase == 'Inhale') {
            _phase = 'Hold';
            _counter = 4;
          } else if (_phase == 'Hold') {
            _phase = 'Exhale';
            _counter = 6;
          } else {
            _phase = 'Inhale';
            _counter = 4;
          }
        }
      });
    });
  }

  void _stop() {
    _timer?.cancel();
    setState(() {
      _isActive = false;
      _phase = 'Inhale';
      _counter = 4;
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Breathing Exercise')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AnimatedContainer(
              duration: Duration(seconds: _phase == 'Inhale' ? 4 : (_phase == 'Hold' ? 0 : 6)),
              height: _phase == 'Inhale' || _phase == 'Hold' ? 200 : 100,
              width: _phase == 'Inhale' || _phase == 'Hold' ? 200 : 100,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.blue.withOpacity(0.3),
              ),
              child: Center(
                child: Text('$_counter', style: const TextStyle(fontSize: 48, fontWeight: FontWeight.bold)),
              ),
            ),
            const SizedBox(height: 40),
            Text(_phase, style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w500)),
            const SizedBox(height: 60),
            if (!_isActive)
              ElevatedButton(onPressed: _start, child: const Text('Start'))
            else
              ElevatedButton(onPressed: _stop, child: const Text('Stop')),
          ],
        ),
      ),
    );
  }
}
