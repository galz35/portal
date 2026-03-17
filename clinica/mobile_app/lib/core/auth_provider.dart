import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'api_client.dart';

class AuthProvider extends ChangeNotifier {
  final ApiClient _api = ApiClient();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  Map<String, dynamic>? _user;
  bool _loading = false;
  String? _error;

  Map<String, dynamic>? get user => _user;
  bool get loading => _loading;
  String? get error => _error;
  bool get isAuthenticated => _user != null;
  String get rol => _user?['rol'] ?? '';
  String get pais => _user?['pais'] ?? 'NI';
  String get nombreCompleto => _user?['nombre_completo'] ?? '';
  int? get idPaciente => _user?['id_paciente'];
  int? get idMedico => _user?['id_medico'];

  AuthProvider() {
    _loadStoredUser();
  }

  Future<void> _loadStoredUser() async {
    _loading = true;
    notifyListeners();
    try {
      final token = await _storage.read(key: 'token');
      final userStr = await _storage.read(key: 'user');
      if (token != null && userStr != null) {
        _user = jsonDecode(userStr);
      }
    } catch (e) {
      debugPrint('Error loading stored user: $e');
    }
    _loading = false;
    notifyListeners();
  }

  Future<bool> login(String carnet, String password) async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _api.dio.post(
        '/auth/login',
        data: {'carnet': carnet, 'password': password},
      );

      final data = response.data;
      final token = data['access_token'];
      final user = data['user'];

      await _api.setToken(token);
      await _storage.write(key: 'user', value: jsonEncode(user));
      _user = user;
      _loading = false;
      notifyListeners();
      return true;
    } on DioException catch (e) {
      _loading = false;
      if (e.response?.statusCode == 401) {
        _error = 'Credenciales inválidas';
      } else {
        _error = 'Error de conexión. Verifique su red.';
      }
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await _api.clearAuth();
    _user = null;
    _error = null;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
