import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../logic/blocs/auth_bloc.dart';

class SignupPage extends StatefulWidget {
  const SignupPage({super.key});
  @override
  State<SignupPage> createState() => _SignupPageState();
}

class _SignupPageState extends State<SignupPage> {
  int _step = 1;
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _workerIdController = TextEditingController();
  final _nameController = TextEditingController();
  String _role = 'user';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(backgroundColor: Colors.transparent),
      body: BlocConsumer<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is AuthError) {
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(state.message)));
          }
        },
        builder: (context, state) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              children: [
                const SizedBox(height: 20),
                Icon(LucideIcons.userPlus, size: 48, color: Theme.of(context).primaryColor),
                const SizedBox(height: 24),
                Text('Pilot Signup', style: GoogleFonts.inter(fontSize: 24, fontWeight: FontWeight.bold)),
                const SizedBox(height: 32),
                if (_step == 1) ...[
                  TextField(controller: _nameController, decoration: const InputDecoration(labelText: 'Full Name', border: OutlineInputBorder())),
                  const SizedBox(height: 16),
                  TextField(controller: _emailController, decoration: const InputDecoration(labelText: 'Company Email', border: OutlineInputBorder())),
                  const SizedBox(height: 16),
                  TextField(controller: _passwordController, obscureText: true, decoration: const InputDecoration(labelText: 'Password', border: OutlineInputBorder())),
                  const SizedBox(height: 16),
                  TextField(controller: _workerIdController, decoration: const InputDecoration(labelText: 'Worker ID', border: OutlineInputBorder())),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<String>(
                    value: _role,
                    decoration: const InputDecoration(labelText: 'Role', border: OutlineInputBorder()),
                    items: const [
                      DropdownMenuItem(value: 'user', child: Text('Pilot')),
                      DropdownMenuItem(value: 'admin', child: Text('Wellness Admin')),
                    ],
                    onChanged: (val) => setState(() => _role = val!),
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: () => setState(() => _step = 2),
                      style: ElevatedButton.styleFrom(backgroundColor: Theme.of(context).primaryColor, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                      child: const Text('Continue'),
                    ),
                  ),
                ] else ...[
                  Text('Verification', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 32),
                  const Text('For this demo, any password will be hashed and stored securely.', textAlign: TextAlign.center),
                  const SizedBox(height: 32),
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: state is AuthLoading
                        ? null
                        : () => context.read<AuthBloc>().add(AuthSignupRequested(
                            _emailController.text,
                            _passwordController.text,
                            _workerIdController.text,
                            _nameController.text,
                            role: _role,
                          )),
                      style: ElevatedButton.styleFrom(backgroundColor: Theme.of(context).primaryColor, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                      child: state is AuthLoading ? const CircularProgressIndicator(color: Colors.white) : const Text('Complete Signup'),
                    ),
                  ),
                  TextButton(onPressed: () => setState(() => _step = 1), child: const Text('Back')),
                ],
              ],
            ),
          );
        },
      ),
    );
  }
}
