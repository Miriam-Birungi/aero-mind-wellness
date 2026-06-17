import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:aero_mind_wellness/data/repositories/supabase_api_service.dart';
import 'package:aero_mind_wellness/data/repositories/auth_repository_impl.dart';
import 'package:aero_mind_wellness/logic/blocs/auth_bloc.dart' as app_auth;
import 'package:aero_mind_wellness/logic/blocs/wellness_bloc.dart';
import 'package:aero_mind_wellness/presentation/pages/signup_page.dart';
import 'package:aero_mind_wellness/presentation/pages/onboarding_page.dart';
import 'package:aero_mind_wellness/presentation/pages/dashboard_page.dart';
import 'package:aero_mind_wellness/presentation/pages/breathing_page.dart';
import 'package:aero_mind_wellness/presentation/pages/resources_page.dart';
import 'package:aero_mind_wellness/presentation/pages/settings_page.dart';
import 'package:aero_mind_wellness/presentation/pages/anonymous_chat_page.dart';
import 'package:aero_mind_wellness/presentation/pages/admin_messages_page.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(
    url: 'https://your-project-url.supabase.co',
    anonKey: 'your-anon-key',
  );

  final prefs = await SharedPreferences.getInstance();
  final apiService = SupabaseApiService();
  final authRepository = AuthRepositoryImpl(apiService: apiService, prefs: prefs);

  runApp(
    MultiBlocProvider(
      providers: [
        BlocProvider(create: (context) => app_auth.AuthBloc(authRepository: authRepository)..add(app_auth.AuthCheckRequested())),
        BlocProvider(create: (context) => WellnessBloc(apiService: apiService)),
      ],
      child: const AeroMindApp(),
    ),
  );
}

class AeroMindApp extends StatelessWidget {
  const AeroMindApp({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocListener<app_auth.AuthBloc, app_auth.AuthState>(
      listener: (context, state) {
        if (state is app_auth.AuthAuthenticated) {
          _router.go('/dashboard');
        } else if (state is app_auth.AuthUnauthenticated) {
          _router.go('/');
        }
      },
      child: MaterialApp.router(
        title: 'AeroMind Wellness',
        debugShowCheckedModeBanner: false,
        localizationsDelegates: const [
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        supportedLocales: const [
          Locale('en'),
          Locale('es'),
        ],
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF2563EB),
            primary: const Color(0xFF2563EB),
            surface: Colors.white,
          ),
          scaffoldBackgroundColor: const Color(0xFFF8FAFC),
          useMaterial3: true,
          textTheme: GoogleFonts.interTextTheme(),
        ),
        routerConfig: _router,
      ),
    );
  }
}

final _router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(path: '/', builder: (context, state) => const LandingPage()),
    GoRoute(path: '/login', builder: (context, state) => const LoginPage()),
    GoRoute(path: '/signup', builder: (context, state) => const SignupPage()),
    GoRoute(path: '/onboarding', builder: (context, state) => const OnboardingPage()),
    GoRoute(path: '/dashboard', builder: (context, state) => const DashboardPage()),
    GoRoute(path: '/breathing', builder: (context, state) => const BreathingExercisePage()),
    GoRoute(path: '/resources', builder: (context, state) => const ResourcesPage()),
    GoRoute(path: '/settings', builder: (context, state) => const SettingsPage()),
    GoRoute(path: '/chat', builder: (context, state) => const AnonymousChatPage()),
    GoRoute(path: '/admin/messages', builder: (context, state) => const AdminMessagesPage()),
  ],
);

class LandingPage extends StatelessWidget {
  const LandingPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFFE0E7FF), Color(0xFFF8FAFC)],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 40.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.blue.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(LucideIcons.planeTakeoff, color: Color(0xFF2563EB)),
                    ),
                    const SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('AeroMind', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold)),
                        Text('Pilot Wellness Intelligence', style: GoogleFonts.inter(fontSize: 12, color: Colors.grey[600])),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 60),
                Text('Helping pilots stay\nmentally fit to fly', style: GoogleFonts.inter(fontSize: 32, fontWeight: FontWeight.bold, height: 1.2)),
                const SizedBox(height: 24),
                Text('AeroMind bridges the gap between mental health and cockpit safety.', style: GoogleFonts.inter(fontSize: 18, color: Colors.grey[700])),
                const SizedBox(height: 40),
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    onPressed: () => context.push('/signup'),
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2563EB), foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                    child: const Row(mainAxisAlignment: MainAxisAlignment.center, children: [Text('Get Started'), SizedBox(width: 8), Icon(LucideIcons.arrowRight, size: 18)]),
                  ),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: OutlinedButton(
                    onPressed: () => context.push('/login'),
                    style: OutlinedButton.styleFrom(side: const BorderSide(color: Color(0xFFCBD5E1)), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                    child: const Text('I Already Have an Account'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});
  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(backgroundColor: Colors.transparent),
      body: BlocConsumer<app_auth.AuthBloc, app_auth.AuthState>(
        listener: (context, state) {
          if (state is app_auth.AuthError) {
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(state.message)));
          }
        },
        builder: (context, state) {
          return Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(LucideIcons.plane, size: 48, color: Color(0xFF2563EB)),
                const SizedBox(height: 32),
                TextField(controller: _emailController, decoration: const InputDecoration(labelText: 'Email', border: OutlineInputBorder())),
                const SizedBox(height: 16),
                TextField(controller: _passwordController, obscureText: true, decoration: const InputDecoration(labelText: 'Password', border: OutlineInputBorder())),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    onPressed: state is app_auth.AuthLoading
                        ? null
                        : () => context.read<app_auth.AuthBloc>().add(app_auth.AuthLoginRequested(_emailController.text, _passwordController.text)),
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2563EB), foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                    child: state is app_auth.AuthLoading ? const CircularProgressIndicator(color: Colors.white) : const Text('Login'),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
