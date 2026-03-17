import '../core/api_client.dart';

class MedicoService {
  final ApiClient _api = ApiClient();

  Future<Map<String, dynamic>> getDashboard() async {
    final r = await _api.dio.get('/medico/dashboard');
    return r.data;
  }

  Future<List<dynamic>> getPacientes() async {
    final r = await _api.dio.get('/medico/pacientes');
    return r.data;
  }

  Future<List<dynamic>> getAgendaCitas() async {
    final r = await _api.dio.get('/medico/agenda-citas');
    return r.data;
  }

  Future<Map<String, dynamic>> agendarCita(Map<String, dynamic> data) async {
    final r = await _api.dio.post('/medico/agenda-citas/agendar', data: data);
    return r.data;
  }

  Future<Map<String, dynamic>> crearAtencion(Map<String, dynamic> data) async {
    final r = await _api.dio.post('/medico/atencion', data: data);
    return r.data;
  }

  Future<List<dynamic>> getCasos({String? estado}) async {
    final r = await _api.dio.get(
      '/medico/casos',
      queryParameters: estado != null ? {'estado': estado} : null,
    );
    return r.data;
  }

  Future<Map<String, dynamic>> getCasoById(int id) async {
    final r = await _api.dio.get('/medico/casos/$id');
    return r.data;
  }

  Future<List<dynamic>> getCitasPorPaciente(int idPaciente) async {
    final r = await _api.dio.get('/medico/pacientes/$idPaciente/citas');
    return r.data;
  }

  Future<List<dynamic>> getChequeosPorPaciente(int idPaciente) async {
    final r = await _api.dio.get('/medico/pacientes/$idPaciente/chequeos');
    return r.data;
  }

  Future<List<dynamic>> getExamenesPorPaciente(int idPaciente) async {
    final r = await _api.dio.get('/medico/pacientes/$idPaciente/examenes');
    return r.data;
  }

  Future<List<dynamic>> getVacunasPorPaciente(int idPaciente) async {
    final r = await _api.dio.get('/medico/pacientes/$idPaciente/vacunas');
    return r.data;
  }

  Future<Map<String, dynamic>> getCitaById(int id) async {
    final r = await _api.dio.get('/medico/citas/$id');
    return r.data;
  }

  Future<List<dynamic>> getCitas() async {
    final r = await _api.dio.get('/medico/citas');
    return r.data;
  }

  Future<List<dynamic>> getExamenes() async {
    final r = await _api.dio.get('/medico/examenes');
    return r.data;
  }

  Future<List<dynamic>> getSeguimientos() async {
    final r = await _api.dio.get('/medico/seguimientos');
    return r.data;
  }

  Future<Map<String, dynamic>> getReporteAtencion(int id) async {
    final r = await _api.dio.get('/medico/reporte-atencion/$id');
    return r.data;
  }

  Future<Map<String, dynamic>> getReportePaciente(int id) async {
    final r = await _api.dio.get('/medico/reporte-paciente/$id');
    return r.data;
  }

  Future<Map<String, dynamic>> registrarVacuna(
    Map<String, dynamic> data,
  ) async {
    final r = await _api.dio.post('/medico/vacunas', data: data);
    return r.data;
  }
}
