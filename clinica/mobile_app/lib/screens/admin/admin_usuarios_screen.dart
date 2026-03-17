import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../services/admin_service.dart';

class AdminUsuariosScreen extends StatefulWidget {
  const AdminUsuariosScreen({super.key});
  @override
  State<AdminUsuariosScreen> createState() => _AdminUsuariosScreenState();
}

class _AdminUsuariosScreenState extends State<AdminUsuariosScreen> {
  final AdminService _service = AdminService();
  List<dynamic> _usuarios = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      _usuarios = await _service.getUsuarios();
    } catch (e) {
      debugPrint('Error: $e');
    }
    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Gestión de Usuarios')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView.builder(
                padding: const EdgeInsets.all(12),
                itemCount: _usuarios.length,
                itemBuilder: (_, i) {
                  final u = _usuarios[i];
                  final activo = u['estado'] == 'A';
                  return Card(
                    margin: const EdgeInsets.only(bottom: 8),
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: activo
                            ? AppTheme.primary.withValues(alpha: 0.1)
                            : AppTheme.error.withValues(alpha: 0.1),
                        child: Icon(
                          Icons.person,
                          color: activo ? AppTheme.primary : AppTheme.error,
                        ),
                      ),
                      title: Text(
                        u['nombre_completo'] ?? u['carnet'] ?? '',
                        style: const TextStyle(fontWeight: FontWeight.w500),
                      ),
                      subtitle: Text(
                        '${u['rol'] ?? ''} · ${u['carnet'] ?? ''}',
                      ),
                      trailing: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          color: activo
                              ? AppTheme.success.withValues(alpha: 0.15)
                              : AppTheme.error.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          activo ? 'Activo' : 'Inactivo',
                          style: TextStyle(
                            fontSize: 11,
                            color: activo ? AppTheme.success : AppTheme.error,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          /* TODO: Navigate to create user */
        },
        backgroundColor: AppTheme.primary,
        foregroundColor: Colors.white,
        child: const Icon(Icons.person_add),
      ),
    );
  }
}
