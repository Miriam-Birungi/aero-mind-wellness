import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:io';
import 'package:flutter/foundation.dart';

class ApiService {
  // Production-ready base URL selection
  static String get _baseUrl {
    if (kIsWeb) return 'http://localhost:3000/api';
    // Handle Android Emulator vs iOS Simulator/Physical Device
    return Platform.isAndroid ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api';
  }

  final Dio _dio = Dio(BaseOptions(
    baseUrl: _baseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 5),
  ));

  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal() {
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final prefs = await SharedPreferences.getInstance();
        final token = prefs.getString('auth_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (DioException e, handler) {
        return handler.next(e);
      },
    ));
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await _dio.post('/auth/login', data: {'email': email, 'password': password});
    return response.data;
  }

  Future<Map<String, dynamic>> signup({
    required String email,
    required String password,
    required String workerId,
    required String name,
    String? role,
  }) async {
    final response = await _dio.post('/auth/signup', data: {
      'email': email,
      'password': password,
      'workerId': workerId,
      'name': name,
      'role': role ?? 'user',
    });
    return response.data;
  }

  Future<void> saveOnboarding(Map<String, dynamic> data) async {
    await _dio.post('/user/onboarding', data: data);
  }

  Future<Map<String, dynamic>> getMetrics() async {
    final response = await _dio.get('/wellness/metrics');
    return response.data;
  }

  Future<void> syncWearableData({
    required int heartRate,
    required double sleepHours,
    required int steps,
  }) async {
    await _dio.post('/wellness/wearable', data: {
      'heartRate': heartRate,
      'sleepHours': sleepHours,
      'steps': steps,
    });
  }

  Future<void> sendAnonymousMessage(String content, {String? category}) async {
    await _dio.post('/messages/anonymous', data: {
      'content': content,
      'category': category ?? 'general',
    });
  }

  Future<List<dynamic>> getAdminMessages() async {
    final response = await _dio.get('/admin/messages');
    return response.data;
  }

  Future<List<dynamic>> getCrisisResources() async {
    final response = await _dio.get('/resources/crisis');
    return response.data;
  }
}
