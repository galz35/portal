import '../core/api_client.dart';

class AdminService {
  final ApiClient _api = ApiClient();

  Future<Map<String, dynamic>> getDashboard() async {
    final r = await _api.dio.get('/admin/dashboard');
    return r.data;
  }

  Future<List<dynamic>> getUsuarios() async {
    final r = await _api.dio.get('/admin/usuarios');
    return r.data;
  }

  Future<Map<String, dynamic>> crearUsuario(Map<String, dynamic> data) async {
    final r = await _api.dio.post('/admin/usuarios', data: data);
    return r.data;
  }

  Future<List<dynamic>> getMedicos() async {
    final r = await _api.dio.get('/admin/medicos');
    return r.data;
  }

  Future<List<dynamic>> getEmpleados({String? carnet}) async {
    final r = await _api.dio.get(
      '/admin/empleados',
      queryParameters: carnet != null ? {'carnet': carnet} : null,
    );
    return r.data;
  }

  Future<Map<String, dynamic>> getRolesPermisos() async {
    final r = await _api.dio.get('/admin/roles-permisos');
    return r.data;
  }

  Future<List<dynamic>> getReportesAtenciones() async {
    final r = await _api.dio.get('/admin/reportes/atenciones');
    return r.data;
  }
}
