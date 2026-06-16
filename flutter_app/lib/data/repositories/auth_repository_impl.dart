import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/auth_repository.dart';
import '../models/user_model.dart';
import 'api_service.dart';

class AuthRepositoryImpl implements AuthRepository {
  final ApiService apiService;
  final SharedPreferences prefs;

  AuthRepositoryImpl({required this.apiService, required this.prefs});

  @override
  Future<User> login(String email, String password) async {
    final data = await apiService.login(email, password);
    final user = UserModel.fromJson(data['user']);
    await prefs.setString('auth_token', data['token']);
    await prefs.setString('user_data', jsonEncode(user.toJson()));
    return user;
  }

  @override
  Future<User> signup(String email, String password, String workerId, String name) async {
    final data = await apiService.signup(
      email: email,
      password: password,
      workerId: workerId,
      name: name
    );
    final user = UserModel.fromJson(data['user']);
    await prefs.setString('auth_token', data['token']);
    await prefs.setString('user_data', jsonEncode(user.toJson()));
    return user;
  }

  @override
  Future<void> logout() async {
    await prefs.remove('auth_token');
    await prefs.remove('user_data');
  }

  @override
  Future<User?> getCurrentUser() async {
    final userData = prefs.getString('user_data');
    if (userData != null) {
      return UserModel.fromJson(jsonDecode(userData));
    }
    return null;
  }
}
