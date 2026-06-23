import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/auth_repository.dart';
import 'package:dio/dio.dart';

// Events
abstract class AuthEvent {}
class AuthCheckRequested extends AuthEvent {}
class AuthLoginRequested extends AuthEvent {
  final String email;
  final String password;
  AuthLoginRequested(this.email, this.password);
}
class AuthSignupRequested extends AuthEvent {
  final String email;
  final String password;
  final String workerId;
  final String name;
  final String? role;
  AuthSignupRequested(this.email, this.password, this.workerId, this.name, {this.role});
}
class AuthLogoutRequested extends AuthEvent {}

// State
abstract class AuthState {}
class AuthInitial extends AuthState {}
class AuthLoading extends AuthState {}
class AuthAuthenticated extends AuthState {
  final User user;
  AuthAuthenticated(this.user);
}
class AuthUnauthenticated extends AuthState {}
class AuthError extends AuthState {
  final String message;
  AuthError(this.message);
}

// BLoC
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository authRepository;

  AuthBloc({required this.authRepository}) : super(AuthInitial()) {
    on<AuthCheckRequested>((event, emit) async {
      final user = await authRepository.getCurrentUser();
      if (user != null) {
        emit(AuthAuthenticated(user));
      } else {
        emit(AuthUnauthenticated());
      }
    });

    on<AuthLoginRequested>((event, emit) async {
      emit(AuthLoading());
      try {
        final user = await authRepository.login(event.email, event.password);
        emit(AuthAuthenticated(user));
      } on DioException catch (e) {
        final msg = e.response?.data?['error'] ?? 'Login failed. Check credentials.';
        emit(AuthError(msg));
      } catch (e) {
        emit(AuthError('An unexpected error occurred.'));
      }
    });

    on<AuthSignupRequested>((event, emit) async {
      emit(AuthLoading());
      try {
        final user = await authRepository.signup(
          event.email,
          event.password,
          event.workerId,
          event.name,
          role: event.role
        );
        emit(AuthAuthenticated(user));
      } on DioException catch (e) {
        final msg = e.response?.data?['error'] ?? 'Signup failed. Please try again.';
        emit(AuthError(msg));
      } catch (e) {
        emit(AuthError('An unexpected error occurred.'));
      }
    });

    on<AuthLogoutRequested>((event, emit) async {
      await authRepository.logout();
      emit(AuthUnauthenticated());
    });
  }
}
