import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/auth_provider.dart';
import '../../core/theme.dart';
import '../../services/paciente_service.dart';

class PacienteDashboardScreen extends StatefulWidget {
  const PacienteDashboardScreen({super.key});

  @override
  State<PacienteDashboardScreen> createState() =>
      _PacienteDashboardScreenState();
}

class _PacienteDashboardScreenState extends State<PacienteDashboardScreen> {
  final PacienteService _service = PacienteService();
  Map<String, dynamic>? _data;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    try {
      _data = await _service.getDashboard();
    } catch (e) {
      debugPrint('Error: $e');
    }
    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final kpis = _data?['kpis'] as Map<String, dynamic>?;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mi Salud'),
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
                  // Greeting
                  Text(
                    'Hola, ${auth.nombreCompleto}',
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Estado Semáforo
                  _buildEstadoCard(kpis?['estadoActual'] ?? 'V'),
                  const SizedBox(height: 16),

                  // KPIs Grid
                  Row(
                    children: [
                      Expanded(
                        child: _InfoCard(
                          icon: Icons.event,
                          label: 'Próxima Cita',
                          value: kpis?['proximaCita'] ?? 'Sin citas',
                          color: AppTheme.primary,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _InfoCard(
                          icon: Icons.track_changes,
                          label: 'Seguimientos',
                          value: '${kpis?['seguimientosActivos'] ?? 0} activos',
                          color: AppTheme.warning,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Quick Actions
                  const Text(
                    'Acciones Rápidas',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 12),
                  _buildQuickActions(),
                  const SizedBox(height: 24),

                  // Timeline
                  const Text(
                    'Historial Reciente',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 12),
                  ..._buildTimeline(),
                ],
              ),
            ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: 0,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Inicio'),
          BottomNavigationBarItem(
            icon: Icon(Icons.add_circle_outline),
            label: 'Chequeo',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.calendar_month),
            label: 'Citas',
          ),
          BottomNavigationBarItem(icon: Icon(Icons.science), label: 'Exámenes'),
        ],
        onTap: (i) {
          switch (i) {
            case 1:
              Navigator.pushNamed(context, '/paciente/chequeo');
              break;
            case 2:
              Navigator.pushNamed(context, '/paciente/citas');
              break;
            case 3:
              Navigator.pushNamed(context, '/paciente/examenes');
              break;
          }
        },
      ),
    );
  }

  Widget _buildEstadoCard(String nivel) {
    final color = AppTheme.semaforoColor(nivel);
    final label = AppTheme.semaforoLabel(nivel);
    return Card(
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: LinearGradient(
            colors: [
              color.withValues(alpha: 0.1),
              color.withValues(alpha: 0.05),
            ],
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.2),
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.favorite, color: color, size: 32),
            ),
            const SizedBox(width: 16),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Tu Estado de Salud',
                  style: TextStyle(fontSize: 13, color: AppTheme.textSecondary),
                ),
                const SizedBox(height: 4),
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: color,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActions() {
    return Row(
      children: [
        Expanded(
          child: _ActionButton(
            icon: Icons.add_circle,
            label: 'Chequeo\nDiario',
            color: AppTheme.success,
            onTap: () => Navigator.pushNamed(context, '/paciente/chequeo'),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _ActionButton(
            icon: Icons.event_note,
            label: 'Solicitar\nCita',
            color: AppTheme.primary,
            onTap: () =>
                Navigator.pushNamed(context, '/paciente/solicitar-cita'),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _ActionButton(
            icon: Icons.history,
            label: 'Mi\nHistorial',
            color: AppTheme.accent,
            onTap: () => Navigator.pushNamed(context, '/paciente/chequeos'),
          ),
        ),
      ],
    );
  }

  List<Widget> _buildTimeline() {
    final timeline = (_data?['timeline'] as List?) ?? [];
    if (timeline.isEmpty) {
      return [
        const Text(
          'Sin actividad reciente',
          style: TextStyle(color: AppTheme.textSecondary),
        ),
      ];
    }
    return timeline
        .map(
          (t) => Card(
            margin: const EdgeInsets.only(bottom: 8),
            child: ListTile(
              leading: CircleAvatar(
                backgroundColor: AppTheme.primary.withValues(alpha: 0.1),
                child: const Icon(
                  Icons.event_note,
                  color: AppTheme.primary,
                  size: 20,
                ),
              ),
              title: Text(
                t['title'] ?? '',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
              subtitle: Text(
                _formatDate(t['date']),
                style: const TextStyle(fontSize: 12),
              ),
            ),
          ),
        )
        .toList();
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

class _InfoCard extends StatelessWidget {
  final IconData icon;
  final String label, value;
  final Color color;
  const _InfoCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });
  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 10),
            Text(
              label,
              style: const TextStyle(
                fontSize: 12,
                color: AppTheme.textSecondary,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              value,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
  const _ActionButton({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });
  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 8),
          child: Column(
            children: [
              Icon(icon, color: color, size: 32),
              const SizedBox(height: 8),
              Text(
                label,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
