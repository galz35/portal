import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../services/paciente_service.dart';

class PacienteMisCitasScreen extends StatefulWidget {
  const PacienteMisCitasScreen({super.key});
  @override
  State<PacienteMisCitasScreen> createState() => _PacienteMisCitasScreenState();
}

class _PacienteMisCitasScreenState extends State<PacienteMisCitasScreen> {
  final PacienteService _service = PacienteService();
  List<dynamic> _citas = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      _citas = await _service.getMisCitas();
    } catch (e) {
      debugPrint('Error: $e');
    }
    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Mis Citas')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _citas.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.event_available,
                    size: 64,
                    color: AppTheme.textSecondary.withValues(alpha: 0.3),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'No tienes citas registradas',
                    style: TextStyle(color: AppTheme.textSecondary),
                  ),
                ],
              ),
            )
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView.builder(
                padding: const EdgeInsets.all(12),
                itemCount: _citas.length,
                itemBuilder: (_, i) {
                  final c = _citas[i];
                  final isProgramada = c['estado_cita'] == 'PROGRAMADA';
                  return Card(
                    margin: const EdgeInsets.only(bottom: 10),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(
                                Icons.calendar_today,
                                size: 18,
                                color: isProgramada
                                    ? AppTheme.primary
                                    : AppTheme.textSecondary,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                '${c['fecha_cita'] ?? ''}'.substring(0, 10),
                                style: const TextStyle(
                                  fontWeight: FontWeight.w600,
                                  fontSize: 16,
                                ),
                              ),
                              const Spacer(),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: isProgramada
                                      ? AppTheme.primary.withValues(alpha: 0.1)
                                      : AppTheme.success.withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  c['estado_cita'] ?? '',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: isProgramada
                                        ? AppTheme.primary
                                        : AppTheme.success,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Row(
                            children: [
                              const Icon(
                                Icons.access_time,
                                size: 16,
                                color: AppTheme.textSecondary,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                c['hora_cita'] ?? '',
                                style: const TextStyle(
                                  color: AppTheme.textSecondary,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              const Icon(
                                Icons.person,
                                size: 16,
                                color: AppTheme.textSecondary,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                'Dr. ${c['medico_nombre'] ?? 'N/A'}',
                                style: const TextStyle(
                                  color: AppTheme.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () =>
            Navigator.pushNamed(context, '/paciente/solicitar-cita'),
        icon: const Icon(Icons.add),
        label: const Text('Solicitar Cita'),
        backgroundColor: AppTheme.primary,
        foregroundColor: Colors.white,
      ),
    );
  }
}
