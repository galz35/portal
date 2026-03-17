import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../services/paciente_service.dart';

class PacienteExamenesScreen extends StatefulWidget {
  const PacienteExamenesScreen({super.key});
  @override
  State<PacienteExamenesScreen> createState() => _PacienteExamenesScreenState();
}

class _PacienteExamenesScreenState extends State<PacienteExamenesScreen> {
  final PacienteService _service = PacienteService();
  List<dynamic> _examenes = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      _examenes = await _service.getMisExamenes();
    } catch (e) {
      debugPrint('Error: $e');
    }
    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Mis Exámenes')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _examenes.isEmpty
          ? const Center(
              child: Text(
                'Sin exámenes registrados',
                style: TextStyle(color: AppTheme.textSecondary),
              ),
            )
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView.builder(
                padding: const EdgeInsets.all(12),
                itemCount: _examenes.length,
                itemBuilder: (_, i) {
                  final e = _examenes[i];
                  final isPendiente = e['estado_examen'] == 'PENDIENTE';
                  return Card(
                    margin: const EdgeInsets.only(bottom: 10),
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: isPendiente
                            ? AppTheme.warning.withValues(alpha: 0.15)
                            : AppTheme.success.withValues(alpha: 0.15),
                        child: Icon(
                          Icons.science,
                          color: isPendiente
                              ? AppTheme.warning
                              : AppTheme.success,
                          size: 20,
                        ),
                      ),
                      title: Text(
                        e['tipo_examen'] ?? '',
                        style: const TextStyle(fontWeight: FontWeight.w500),
                      ),
                      subtitle: Text(
                        '${_formatDate(e['fecha_solicitud'])} · ${e['laboratorio'] ?? 'Sin lab'}',
                      ),
                      trailing: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          color: isPendiente
                              ? AppTheme.warning.withValues(alpha: 0.15)
                              : AppTheme.success.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          e['estado_examen'] ?? '',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: isPendiente
                                ? AppTheme.warning
                                : AppTheme.success,
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
    );
  }

  String _formatDate(dynamic d) {
    if (d == null) return '';
    try {
      return DateTime.parse(d.toString()).toString().substring(0, 10);
    } catch (_) {
      return '$d';
    }
  }
}
