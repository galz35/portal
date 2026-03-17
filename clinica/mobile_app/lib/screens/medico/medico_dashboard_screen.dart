import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/auth_provider.dart';
import '../../core/theme.dart';
import '../../services/medico_service.dart';

class MedicoDashboardScreen extends StatefulWidget {
  const MedicoDashboardScreen({super.key});

  @override
  State<MedicoDashboardScreen> createState() => _MedicoDashboardScreenState();
}

class _MedicoDashboardScreenState extends State<MedicoDashboardScreen> {
  final MedicoService _service = MedicoService();
  Map<String, dynamic>? _stats;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    try {
      _stats = await _service.getDashboard();
    } catch (e) {
      debugPrint('Error: $e');
    }
    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard Médico'),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _loadData),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => auth.logout(),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadData,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  Text(
                    'Dr. ${auth.nombreCompleto}',
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 20),

                  // KPIs Row
                  Row(
                    children: [
                      Expanded(
                        child: _KpiCard(
                          icon: Icons.calendar_today,
                          label: 'Citas Hoy',
                          value: '${_stats?['citasHoyCount'] ?? 0}',
                          color: AppTheme.primary,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _KpiCard(
                          icon: Icons.warning_amber,
                          label: 'Alertas Rojas',
                          value: '${_stats?['pacientesEnRojoCount'] ?? 0}',
                          color: AppTheme.error,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _KpiCard(
                          icon: Icons.folder_open,
                          label: 'Casos Abiertos',
                          value: '${_stats?['casosAbiertos'] ?? 0}',
                          color: AppTheme.warning,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Citas de Hoy
                  const Text(
                    'Citas de Hoy',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 12),
                  ..._buildCitasHoy(),

                  const SizedBox(height: 24),
                  // Pacientes en Rojo
                  if ((_stats?['pacientesEnRojoCount'] ?? 0) > 0) ...[
                    Row(
                      children: [
                        Container(
                          width: 10,
                          height: 10,
                          decoration: const BoxDecoration(
                            color: AppTheme.error,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          'Pacientes en Alerta Roja',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    ..._buildPacientesRojo(),
                  ],
                ],
              ),
            ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: 0,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.dashboard),
            label: 'Dashboard',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.calendar_month),
            label: 'Agenda',
          ),
          BottomNavigationBarItem(icon: Icon(Icons.people), label: 'Pacientes'),
          BottomNavigationBarItem(icon: Icon(Icons.assignment), label: 'Casos'),
        ],
        onTap: (i) {
          switch (i) {
            case 1:
              Navigator.pushNamed(context, '/medico/agenda');
              break;
            case 2:
              Navigator.pushNamed(context, '/medico/pacientes');
              break;
            case 3:
              Navigator.pushNamed(context, '/medico/casos');
              break;
          }
        },
      ),
    );
  }

  List<Widget> _buildCitasHoy() {
    final citas = (_stats?['citasHoy'] as List?) ?? [];
    if (citas.isEmpty) {
      return [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                Icon(
                  Icons.event_available,
                  size: 48,
                  color: AppTheme.success.withValues(alpha: 0.5),
                ),
                const SizedBox(height: 8),
                const Text(
                  'No hay citas programadas para hoy',
                  style: TextStyle(color: AppTheme.textSecondary),
                ),
              ],
            ),
          ),
        ),
      ];
    }
    return citas
        .map(
          (c) => Card(
            margin: const EdgeInsets.only(bottom: 8),
            child: ListTile(
              leading: CircleAvatar(
                backgroundColor: AppTheme.semaforoColor(
                  c['nivel_semaforo_paciente'] ?? c['nivel_semaforo'],
                ).withValues(alpha: 0.15),
                child: Icon(
                  Icons.person,
                  color: AppTheme.semaforoColor(
                    c['nivel_semaforo_paciente'] ?? c['nivel_semaforo'],
                  ),
                ),
              ),
              title: Text(
                c['paciente_nombre'] ?? 'Paciente',
                style: const TextStyle(fontWeight: FontWeight.w500),
              ),
              subtitle: Text(
                '${c['hora_cita'] ?? ''} · ${c['motivo_consulta'] ?? c['codigo_caso'] ?? ''}',
              ),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => Navigator.pushNamed(
                context,
                '/medico/atencion',
                arguments: c['id_cita'],
              ),
            ),
          ),
        )
        .toList();
  }

  List<Widget> _buildPacientesRojo() {
    final pacientes = (_stats?['pacientesEnRojo'] as List?) ?? [];
    return pacientes
        .map(
          (p) => Card(
            margin: const EdgeInsets.only(bottom: 8),
            color: AppTheme.error.withValues(alpha: 0.05),
            child: ListTile(
              leading: const CircleAvatar(
                backgroundColor: AppTheme.error,
                child: Icon(Icons.warning, color: Colors.white, size: 18),
              ),
              title: Text(
                p['nombre_completo'] ?? '',
                style: const TextStyle(fontWeight: FontWeight.w500),
              ),
              subtitle: Text(p['carnet'] ?? ''),
            ),
          ),
        )
        .toList();
  }
}

class _KpiCard extends StatelessWidget {
  final IconData icon;
  final String label, value;
  final Color color;
  const _KpiCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
        child: Column(
          children: [
            Icon(icon, color: color, size: 26),
            const SizedBox(height: 8),
            Text(
              value,
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: const TextStyle(
                fontSize: 11,
                color: AppTheme.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
