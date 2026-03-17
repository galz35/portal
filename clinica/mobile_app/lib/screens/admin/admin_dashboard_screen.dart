import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/auth_provider.dart';
import '../../core/theme.dart';
import '../../services/admin_service.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  final AdminService _service = AdminService();
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
      final data = await _service.getDashboard();
      setState(() {
        _stats = data;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard Admin'),
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
                    'Bienvenido, ${auth.nombreCompleto}',
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'País: ${auth.pais}',
                    style: const TextStyle(color: AppTheme.textSecondary),
                  ),
                  const SizedBox(height: 20),
                  _buildKpiRow(),
                  const SizedBox(height: 24),
                  const Text(
                    'Últimos Usuarios',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 12),
                  ..._buildUltimosUsuarios(),
                ],
              ),
            ),
      bottomNavigationBar: _buildBottomNav(context),
    );
  }

  Widget _buildKpiRow() {
    return Row(
      children: [
        Expanded(
          child: _KpiCard(
            icon: Icons.people,
            label: 'Usuarios',
            value: '${_stats?['totalUsuarios'] ?? 0}',
            color: AppTheme.primary,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _KpiCard(
            icon: Icons.medical_services,
            label: 'Médicos',
            value: '${_stats?['medicosActivos'] ?? 0}',
            color: AppTheme.accent,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _KpiCard(
            icon: Icons.person,
            label: 'Pacientes',
            value: '${_stats?['pacientesActivos'] ?? 0}',
            color: AppTheme.success,
          ),
        ),
      ],
    );
  }

  List<Widget> _buildUltimosUsuarios() {
    final usuarios = (_stats?['ultimosUsuarios'] as List?) ?? [];
    if (usuarios.isEmpty) {
      return [
        const Text(
          'Sin registros',
          style: TextStyle(color: AppTheme.textSecondary),
        ),
      ];
    }
    return usuarios
        .map(
          (u) => Card(
            margin: const EdgeInsets.only(bottom: 8),
            child: ListTile(
              leading: CircleAvatar(
                backgroundColor: AppTheme.primary.withValues(alpha: 0.1),
                child: const Icon(Icons.person, color: AppTheme.primary),
              ),
              title: Text(
                u['nombre_completo'] ?? u['carnet'] ?? '',
                style: const TextStyle(fontWeight: FontWeight.w500),
              ),
              subtitle: Text('${u['rol'] ?? ''} · ${u['carnet'] ?? ''}'),
              trailing: Text(
                _formatDate(u['fecha_creacion']),
                style: const TextStyle(
                  fontSize: 11,
                  color: AppTheme.textSecondary,
                ),
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
      return '';
    }
  }

  Widget _buildBottomNav(BuildContext context) {
    return BottomNavigationBar(
      currentIndex: 0,
      items: const [
        BottomNavigationBarItem(
          icon: Icon(Icons.dashboard),
          label: 'Dashboard',
        ),
        BottomNavigationBarItem(icon: Icon(Icons.people), label: 'Usuarios'),
        BottomNavigationBarItem(
          icon: Icon(Icons.medical_services),
          label: 'Médicos',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.assessment),
          label: 'Reportes',
        ),
      ],
      onTap: (i) {
        switch (i) {
          case 1:
            Navigator.pushNamed(context, '/admin/usuarios');
            break;
          case 2:
            Navigator.pushNamed(context, '/admin/medicos');
            break;
          case 3:
            Navigator.pushNamed(context, '/admin/reportes');
            break;
        }
      },
    );
  }
}

class _KpiCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
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
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
        child: Column(
          children: [
            Icon(icon, color: color, size: 28),
            const SizedBox(height: 8),
            Text(
              value,
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: const TextStyle(
                fontSize: 12,
                color: AppTheme.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
