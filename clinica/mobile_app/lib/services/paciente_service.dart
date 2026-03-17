import '../core/api_client.dart';

class PacienteService {
  final ApiClient _api = ApiClient();

  Future<Map<String, dynamic>> getDashboard() async {
    final r = await _api.dio.get('/paciente/dashboard');
    return r.data;
  }

  Future<List<dynamic>> getMisCitas() async {
    final r = await _api.dio.get('/paciente/mis-citas');
    return r.data;
  }

  Future<List<dynamic>> getMisChequeos() async {
    final r = await _api.dio.get('/paciente/mis-chequeos');
    return r.data;
  }

  Future<List<dynamic>> getMisExamenes() async {
    final r = await _api.dio.get('/paciente/mis-examenes');
    return r.data;
  }

  Future<List<dynamic>> getMisVacunas() async {
    final r = await _api.dio.get('/paciente/mis-vacunas');
    return r.data;
  }

  Future<Map<String, dynamic>> solicitarCita(Map<String, dynamic> data) async {
    final r = await _api.dio.post('/paciente/solicitar-cita', data: data);
    return r.data;
  }

  Future<Map<String, dynamic>> crearChequeo(Map<String, dynamic> data) async {
    final r = await _api.dio.post('/paciente/chequeo', data: data);
    return r.data;
  }
}
