import '../../domain/entities/user.dart';

abstract class AuthRepository {
  Future<User> login(String email, String password);
  Future<User> signup(String email, String password, String workerId, String name);
  Future<void> logout();
  Future<User?> getCurrentUser();
}
