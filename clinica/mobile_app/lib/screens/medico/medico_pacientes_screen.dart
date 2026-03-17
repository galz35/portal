import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../services/medico_service.dart';

class MedicoPacientesScreen extends StatefulWidget {
  const MedicoPacientesScreen({super.key});
  @override
  State<MedicoPacientesScreen> createState() => _MedicoPacientesScreenState();
}

class _MedicoPacientesScreenState extends State<MedicoPacientesScreen> {
  final MedicoService _service = MedicoService();
  List<dynamic> _pacientes = [];
  List<dynamic> _filtered = [];
  bool _loading = true;
  final _searchCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadData();
    _searchCtrl.addListener(_filterList);
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    try {
      _pacientes = await _service.getPacientes();
      _filtered = _pacientes;
    } catch (e) {
      debugPrint('Error: $e');
    }
    setState(() => _loading = false);
  }

  void _filterList() {
    final q = _searchCtrl.text.toLowerCase();
    setState(() {
      _filtered = _pacientes
          .where(
            (p) =>
                (p['nombre_completo'] ?? '').toString().toLowerCase().contains(
                  q,
                ) ||
                (p['carnet'] ?? '').toString().toLowerCase().contains(q),
          )
          .toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Pacientes')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: TextField(
              controller: _searchCtrl,
              decoration: const InputDecoration(
                hintText: 'Buscar por nombre o carnet...',
                prefixIcon: Icon(Icons.search),
              ),
            ),
          ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _filtered.isEmpty
                ? const Center(child: Text('Sin resultados'))
                : RefreshIndicator(
                    onRefresh: _loadData,
                    child: ListView.builder(
                      itemCount: _filtered.length,
                      itemBuilder: (_, i) {
                        final p = _filtered[i];
                        return Card(
                          margin: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 4,
                          ),
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: AppTheme.semaforoColor(
                                p['nivel_semaforo'],
                              ).withValues(alpha: 0.15),
                              child: Text(
                                (p['nombre_completo'] ?? 'P')[0],
                                style: TextStyle(
                                  color: AppTheme.semaforoColor(
                                    p['nivel_semaforo'],
                                  ),
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            title: Text(
                              p['nombre_completo'] ?? '',
                              style: const TextStyle(
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            subtitle: Text(
                              '${p['carnet'] ?? ''} · Semáforo: ${AppTheme.semaforoLabel(p['nivel_semaforo'])}',
                            ),
                            trailing: const Icon(Icons.chevron_right),
                            onTap: () => _showPacienteDetail(p),
                          ),
                        );
                      },
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  void _showPacienteDetail(Map<String, dynamic> p) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        maxChildSize: 0.9,
        minChildSize: 0.4,
        expand: false,
        builder: (_, ctrl) => ListView(
          controller: ctrl,
          padding: const EdgeInsets.all(20),
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              p['nombre_completo'] ?? '',
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            _detailRow('Carnet', p['carnet']),
            _detailRow('Correo', p['correo'] ?? p['correo_usuario'] ?? 'N/A'),
            _detailRow('Teléfono', p['telefono'] ?? 'N/A'),
            _detailRow('Gerencia', p['gerencia'] ?? 'N/A'),
            _detailRow('Área', p['area'] ?? 'N/A'),
            _detailRow('Semáforo', AppTheme.semaforoLabel(p['nivel_semaforo'])),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: () {
                Navigator.pop(context);
                Navigator.pushNamed(
                  context,
                  '/medico/paciente-historial',
                  arguments: p['id_paciente'],
                );
              },
              icon: const Icon(Icons.history),
              label: const Text('Ver Historial Completo'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _detailRow(String label, dynamic value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: const TextStyle(
                color: AppTheme.textSecondary,
                fontSize: 13,
              ),
            ),
          ),
          Expanded(
            child: Text(
              '$value',
              style: const TextStyle(fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }
}
