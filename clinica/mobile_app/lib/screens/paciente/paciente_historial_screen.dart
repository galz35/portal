import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../services/paciente_service.dart';

class PacienteHistorialScreen extends StatefulWidget {
  const PacienteHistorialScreen({super.key});
  @override
  State<PacienteHistorialScreen> createState() =>
      _PacienteHistorialScreenState();
}

class _PacienteHistorialScreenState extends State<PacienteHistorialScreen> {
  final PacienteService _service = PacienteService();
  List<dynamic> _chequeos = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      _chequeos = await _service.getMisChequeos();
    } catch (e) {
      debugPrint('Error: $e');
    }
    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Historial Chequeos')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _chequeos.isEmpty
          ? const Center(
              child: Text(
                'Sin chequeos registrados',
                style: TextStyle(color: AppTheme.textSecondary),
              ),
            )
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView.builder(
                padding: const EdgeInsets.all(12),
                itemCount: _chequeos.length,
                itemBuilder: (_, i) {
                  final c = _chequeos[i];
                  final color = AppTheme.semaforoColor(c['nivel_semaforo']);
                  return Card(
                    margin: const EdgeInsets.only(bottom: 10),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 12,
                                height: 12,
                                decoration: BoxDecoration(
                                  color: color,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                AppTheme.semaforoLabel(c['nivel_semaforo']),
                                style: TextStyle(
                                  fontWeight: FontWeight.w600,
                                  color: color,
                                ),
                              ),
                              const Spacer(),
                              Text(
                                _formatDate(c['fecha_registro']),
                                style: const TextStyle(
                                  color: AppTheme.textSecondary,
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                          const Divider(height: 20),
                          Text(
                            'Datos: ${c['datos_completos'] ?? 'N/A'}',
                            maxLines: 3,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontSize: 13),
                          ),
                        ],
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
      return DateTime.parse(d.toString()).toString().substring(0, 16);
    } catch (_) {
      return '$d';
    }
  }
}
