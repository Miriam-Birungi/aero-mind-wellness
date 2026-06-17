import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/user_model.dart';

class SupabaseApiService {
  final _supabase = Supabase.instance.client;

  Future<UserModel> signup({
    required String email,
    required String password,
    required String name,
    required String workerId,
    String? role,
  }) async {
    final response = await _supabase.auth.signUp(
      email: email,
      password: password,
      data: {
        'name': name,
        'worker_id': workerId,
        'role': role ?? 'user',
      },
    );

    if (response.user == null) throw Exception('Signup failed');

    final profile = await _supabase
        .from('profiles')
        .select()
        .eq('id', response.user!.id)
        .single();

    return UserModel.fromJson({
      'id': response.user!.id,
      'email': response.user!.email,
      ...profile,
    });
  }

  Future<UserModel> login(String email, String password) async {
    final response = await _supabase.auth.signInWithPassword(
      email: email,
      password: password,
    );

    if (response.user == null) throw Exception('Login failed');

    final profile = await _supabase
        .from('profiles')
        .select()
        .eq('id', response.user!.id)
        .single();

    return UserModel.fromJson({
      'id': response.user!.id,
      'email': response.user!.email,
      ...profile,
    });
  }

  Future<void> logout() async {
    await _supabase.auth.signOut();
  }

  Future<Map<String, dynamic>> getMetrics() async {
    final user = _supabase.auth.currentUser;
    if (user == null) throw Exception('Not authenticated');

    final metrics = await _supabase
        .from('wellness_metrics')
        .select()
        .eq('user_id', user.id)
        .order('recorded_at', ascending: false)
        .limit(7);

    if (metrics.isEmpty) {
      return {
        'score': 0,
        'heartRate': 0,
        'sleepHours': 0,
        'steps': 0,
        'history': [],
        'insights': ["No data available yet. Start syncing your wearable."]
      };
    }

    final latest = metrics.first;
    return {
      'score': latest['score'],
      'heartRate': latest['heart_rate'],
      'sleepHours': latest['sleep_hours'],
      'steps': latest['steps'],
      'history': metrics.map((m) => {
        'date': m['recorded_at'], // Need formatting on frontend
        'score': m['score']
      }).toList(),
      'insights': [
        latest['score'] > 80 ? "✨ Excellent wellness." : "⚠️ Fatigue risk detected.",
        "DB Data: Metrics retrieved from Supabase."
      ]
    };
  }

  Future<void> syncWearableData({
    required int heartRate,
    required double sleepHours,
    required int steps,
  }) async {
    final user = _supabase.auth.currentUser;
    if (user == null) throw Exception('Not authenticated');

    final score = (heartRate < 80 && sleepHours > 7) ? 85 : 60; // Simplified calculation

    await _supabase.from('wellness_metrics').insert({
      'user_id': user.id,
      'heart_rate': heartRate,
      'sleep_hours': sleepHours,
      'steps': steps,
      'score': score,
    });
  }

  Future<void> sendAnonymousMessage(String content, {String? category}) async {
    await _supabase.from('anonymous_messages').insert({
      'content': content,
      'category': category ?? 'general',
    });
  }

  Future<List<dynamic>> getAdminMessages() async {
    return await _supabase
        .from('anonymous_messages')
        .select()
        .order('created_at', ascending: false);
  }
}
