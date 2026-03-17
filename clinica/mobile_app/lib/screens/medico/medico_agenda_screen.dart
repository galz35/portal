import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../core/auth_provider.dart';
import '../../services/medico_service.dart';

class MedicoAgendaScreen extends StatefulWidget {
  const MedicoAgendaScreen({super.key});
  @override
  State<MedicoAgendaScreen> createState() => _MedicoAgendaScreenState();
}

class _MedicoAgendaScreenState extends State<MedicoAgendaScreen> {
  final MedicoService _service = MedicoService();
  List<dynamic> _casos = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      _casos = await _service.getAgendaCitas();
    } catch (e) {
      debugPrint('Error: $e');
    }
    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Agenda de Citas')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _casos.isEmpty
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.event_available,
                    size: 64,
                    color: AppTheme.textSecondary,
                  ),
                  SizedBox(height: 12),
                  Text(
                    'Sin casos pendientes por agendar',
                    style: TextStyle(color: AppTheme.textSecondary),
                  ),
                ],
              ),
            )
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView.builder(
                padding: const EdgeInsets.all(12),
                itemCount: _casos.length,
                itemBuilder: (_, i) {
                  final c = _casos[i];
                  return Card(
                    margin: const EdgeInsets.only(bottom: 10),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              CircleAvatar(
                                backgroundColor: AppTheme.semaforoColor(
                                  c['paciente_semaforo'] ?? c['nivel_semaforo'],
                                ).withValues(alpha: 0.15),
                                radius: 20,
                                child: Text(
                                  (c['paciente_nombre'] ?? 'P')[0],
                                  style: TextStyle(
                                    color: AppTheme.semaforoColor(
                                      c['paciente_semaforo'] ??
                                          c['nivel_semaforo'],
                                    ),
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      c['paciente_nombre'] ?? '',
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w600,
                                        fontSize: 16,
                                      ),
                                    ),
                                    Text(
                                      c['paciente_carnet'] ?? '',
                                      style: const TextStyle(
                                        color: AppTheme.textSecondary,
                                        fontSize: 13,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 3,
                                ),
                                decoration: BoxDecoration(
                                  color: AppTheme.warning.withValues(
                                    alpha: 0.15,
                                  ),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  c['codigo_caso'] ?? '',
                                  style: const TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                    color: AppTheme.warning,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Text(
                            c['motivo_consulta'] ?? '',
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontSize: 13),
                          ),
                          const SizedBox(height: 12),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              onPressed: () => _showAgendarDialog(c),
                              icon: const Icon(Icons.calendar_month, size: 18),
                              label: const Text('Agendar Cita'),
                            ),
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

  void _showAgendarDialog(Map<String, dynamic> caso) {
    DateTime selectedDate = DateTime.now().add(const Duration(days: 1));
    final horaCtrl = TextEditingController(text: '09:00');

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          title: const Text('Agendar Cita'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Paciente: ${caso['paciente_nombre']}',
                style: const TextStyle(fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 16),
              ListTile(
                leading: const Icon(
                  Icons.calendar_today,
                  color: AppTheme.primary,
                ),
                title: Text(
                  '${selectedDate.year}-${selectedDate.month.toString().padLeft(2, '0')}-${selectedDate.day.toString().padLeft(2, '0')}',
                ),
                subtitle: const Text('Toca para cambiar'),
                onTap: () async {
                  final d = await showDatePicker(
                    context: ctx,
                    initialDate: selectedDate,
                    firstDate: DateTime.now(),
                    lastDate: DateTime.now().add(const Duration(days: 90)),
                  );
                  if (d != null) setDialogState(() => selectedDate = d);
                },
              ),
              TextField(
                controller: horaCtrl,
                decoration: const InputDecoration(
                  labelText: 'Hora (HH:mm)',
                  prefixIcon: Icon(Icons.access_time),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancelar'),
            ),
            ElevatedButton(
              onPressed: () async {
                Navigator.pop(ctx);
                try {
                  await _service.agendarCita({
                    'idCaso': caso['id_caso'],
                    'idMedico': context.read<AuthProvider>().idMedico ?? 0,
                    'fechaCita':
                        '${selectedDate.year}-${selectedDate.month.toString().padLeft(2, '0')}-${selectedDate.day.toString().padLeft(2, '0')}',
                    'horaCita': horaCtrl.text,
                  });
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('✅ Cita agendada'),
                        backgroundColor: AppTheme.success,
                      ),
                    );
                    _load();
                  }
                } catch (e) {
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Error: $e'),
                        backgroundColor: AppTheme.error,
                      ),
                    );
                  }
                }
              },
              child: const Text('Agendar'),
            ),
          ],
        ),
      ),
    );
  }
}
