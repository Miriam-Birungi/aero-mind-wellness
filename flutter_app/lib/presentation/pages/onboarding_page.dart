import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class OnboardingPage extends StatefulWidget {
  const OnboardingPage({super.key});

  @override
  State<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends State<OnboardingPage> {
  int _currentStep = 0;
  bool _isSaving = false;

  final _airlineController = TextEditingController();
  String _role = 'Captain';
  int _compliance = 1;

  void _next() async {
    if (_currentStep < 2) {
      setState(() => _currentStep++);
    } else {
      setState(() => _isSaving = true);
      try {
        final user = Supabase.instance.client.auth.currentUser;
        if (user == null) return;

        final data = {
          'airline': _airlineController.text,
          'role': _role,
          'compliance': _compliance,
        };

        await Supabase.instance.client.from('onboarding_data').upsert({
          'user_id': user.id,
          'data': data,
          'completed_at': DateTime.now().toIso8601String(),
        });

        final prefs = await SharedPreferences.getInstance();
        await prefs.setBool('onboarded', true);

        if (mounted) context.go('/dashboard');
      } catch (e) {
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to save preferences.')));
      } finally {
        if (mounted) setState(() => _isSaving = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Setup Your Profile')),
      body: _isSaving
        ? const Center(child: CircularProgressIndicator())
        : Stepper(
            currentStep: _currentStep,
            onStepContinue: _next,
            onStepCancel: () => _currentStep > 0 ? setState(() => _currentStep--) : null,
            steps: [
              Step(
                title: const Text('Work Context'),
                content: Column(
                  children: [
                    TextField(controller: _airlineController, decoration: const InputDecoration(labelText: 'Airline')),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<String>(
                      value: _role,
                      decoration: const InputDecoration(labelText: 'Role'),
                      items: const [
                        DropdownMenuItem(value: 'Captain', child: Text('Captain')),
                        DropdownMenuItem(value: 'First Officer', child: Text('First Officer')),
                      ],
                      onChanged: (v) => setState(() => _role = v!),
                    ),
                  ],
                ),
                isActive: _currentStep >= 0,
              ),
              Step(
                title: const Text('Regulatory Compliance'),
                content: Column(
                  children: [
                    RadioListTile(value: 1, groupValue: _compliance, title: const Text('UCAA (Uganda)'), onChanged: (v) => setState(() => _compliance = v!)),
                    RadioListTile(value: 2, groupValue: _compliance, title: const Text('KCAA (Kenya)'), onChanged: (v) => setState(() => _compliance = v!)),
                    RadioListTile(value: 3, groupValue: _compliance, title: const Text('TCAA (Tanzania)'), onChanged: (v) => setState(() => _compliance = v!)),
                  ],
                ),
                isActive: _currentStep >= 1,
              ),
              Step(
                title: const Text('Ready to Start'),
                content: const Text('Your profile is almost ready. We will use this data to tailor your wellness insights via Supabase.'),
                isActive: _currentStep >= 2,
              ),
            ],
          ),
    );
  }
}
