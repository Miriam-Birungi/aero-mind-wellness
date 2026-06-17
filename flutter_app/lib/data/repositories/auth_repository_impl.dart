import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart' as sb;
import '../../domain/entities/user.dart';
import '../../domain/repositories/auth_repository.dart';
import '../models/user_model.dart';
import 'supabase_api_service.dart';

class AuthRepositoryImpl implements AuthRepository {
  final SupabaseApiService apiService;
  final SharedPreferences prefs;

  AuthRepositoryImpl({required this.apiService, required this.prefs});

  @override
  Future<User> login(String email, String password) async {
    final user = await apiService.login(email, password);
    await prefs.setString('user_data', jsonEncode(user.toJson()));
    return user;
  }

  @override
  Future<User> signup(String email, String password, String workerId, String name, {String? role}) async {
    final user = await apiService.signup(
      email: email,
      password: password,
      workerId: workerId,
      name: name,
      role: role
    );
    await prefs.setString('user_data', jsonEncode(user.toJson()));
    return user;
  }

  @override
  Future<void> logout() async {
    await apiService.logout();
    await prefs.remove('user_data');
  }

  @override
  Future<User?> getCurrentUser() async {
    final session = sb.Supabase.instance.client.auth.currentSession;
    if (session == null) return null;

    final userData = prefs.getString('user_data');
    if (userData != null) {
      return UserModel.fromJson(jsonDecode(userData));
    }
    return null;
  }
}
