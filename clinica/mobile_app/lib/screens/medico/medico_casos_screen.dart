import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../services/medico_service.dart';

class MedicoCasosScreen extends StatefulWidget {
  const MedicoCasosScreen({super.key});
  @override
  State<MedicoCasosScreen> createState() => _MedicoCasosScreenState();
}

class _MedicoCasosScreenState extends State<MedicoCasosScreen>
    with SingleTickerProviderStateMixin {
  final MedicoService _service = MedicoService();
  late TabController _tabCtrl;
  List<dynamic> _todos = [], _abiertos = [], _cerrados = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 3, vsync: this);
    _loadData();
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    try {
      _todos = await _service.getCasos();
      _abiertos = _todos
          .where(
            (c) =>
                c['estado_caso'] == 'Abierto' || c['estado_caso'] == 'Agendado',
          )
          .toList();
      _cerrados = _todos.where((c) => c['estado_caso'] == 'Cerrado').toList();
    } catch (e) {
      debugPrint('Error: $e');
    }
    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Casos Clínicos'),
        bottom: TabBar(
          controller: _tabCtrl,
          indicatorColor: Colors.white,
          tabs: [
            Tab(text: 'Todos (${_todos.length})'),
            Tab(text: 'Abiertos (${_abiertos.length})'),
            Tab(text: 'Cerrados (${_cerrados.length})'),
          ],
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _tabCtrl,
              children: [
                _buildList(_todos),
                _buildList(_abiertos),
                _buildList(_cerrados),
              ],
            ),
    );
  }

  Widget _buildList(List<dynamic> casos) {
    if (casos.isEmpty) return const Center(child: Text('Sin casos'));
    return RefreshIndicator(
      onRefresh: _loadData,
      child: ListView.builder(
        padding: const EdgeInsets.all(12),
        itemCount: casos.length,
        itemBuilder: (_, i) {
          final c = casos[i];
          final isOpen = c['estado_caso'] != 'Cerrado';
          return Card(
            margin: const EdgeInsets.only(bottom: 8),
            child: ListTile(
              leading: CircleAvatar(
                backgroundColor: AppTheme.semaforoColor(
                  c['nivel_semaforo'],
                ).withValues(alpha: 0.15),
                child: Icon(
                  isOpen ? Icons.folder_open : Icons.folder,
                  color: AppTheme.semaforoColor(c['nivel_semaforo']),
                  size: 20,
                ),
              ),
              title: Text(
                c['codigo_caso'] ?? 'Caso',
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),
              subtitle: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    c['paciente_nombre'] ?? '',
                    style: const TextStyle(fontSize: 13),
                  ),
                  Text(
                    c['motivo_consulta'] ?? '',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                ],
              ),
              isThreeLine: true,
              trailing: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: isOpen
                          ? AppTheme.warning.withValues(alpha: 0.15)
                          : AppTheme.success.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      c['estado_caso'] ?? '',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: isOpen ? AppTheme.warning : AppTheme.success,
                      ),
                    ),
                  ),
                ],
              ),
              onTap: () => Navigator.pushNamed(
                context,
                '/medico/caso-detalle',
                arguments: c['id_caso'],
              ),
            ),
          );
        },
      ),
    );
  }
}
