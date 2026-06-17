import '../../domain/entities/user.dart';

class UserModel extends User {
  UserModel({
    required super.id,
    required super.email,
    required super.name,
    required super.workerId,
    required super.role,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'],
      email: json['email'],
      name: json['name'],
      workerId: json['workerId'],
      role: json['role'] ?? 'user',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'workerId': workerId,
      'role': role,
    };
  }
}
