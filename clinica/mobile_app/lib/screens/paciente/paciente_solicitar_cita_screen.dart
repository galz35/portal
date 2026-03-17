import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../services/paciente_service.dart';

class PacienteSolicitarCitaScreen extends StatefulWidget {
  const PacienteSolicitarCitaScreen({super.key});
  @override
  State<PacienteSolicitarCitaScreen> createState() =>
      _PacienteSolicitarCitaScreenState();
}

class _PacienteSolicitarCitaScreenState
    extends State<PacienteSolicitarCitaScreen> {
  final PacienteService _service = PacienteService();
  int _step = 0;
  bool _submitting = false;
  String _ruta = 'consulta';
  final _motivoCtrl = TextEditingController();
  final _sintomasCtrl = TextEditingController();

  @override
  void dispose() {
    _motivoCtrl.dispose();
    _sintomasCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() => _submitting = true);
    try {
      await _service.solicitarCita({
        'ruta': _ruta,
        'comentarioGeneral': _motivoCtrl.text,
        'datosCompletos':
            '{"motivo":"${_motivoCtrl.text}","sintomas":"${_sintomasCtrl.text}","ruta":"$_ruta"}',
      });
      if (mounted) {
        showDialog(
          context: context,
          builder: (_) => AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppTheme.success.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.check_circle,
                    color: AppTheme.success,
                    size: 64,
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  '¡Solicitud Enviada!',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Tu solicitud ha sido procesada. Te notificaremos cuando un médico agende tu cita.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: AppTheme.textSecondary),
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                    Navigator.pop(context);
                  },
                  child: const Text('Aceptar'),
                ),
              ],
            ),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: AppTheme.error),
        );
      }
    }
    setState(() => _submitting = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Solicitar Cita')),
      body: Column(
        children: [
          LinearProgressIndicator(
            value: (_step + 1) / 3,
            backgroundColor: AppTheme.divider,
            color: AppTheme.primary,
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: _buildStep(),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                if (_step > 0)
                  OutlinedButton(
                    onPressed: () => setState(() => _step--),
                    child: const Text('Anterior'),
                  ),
                const Spacer(),
                if (_step < 2)
                  ElevatedButton(
                    onPressed: () => setState(() => _step++),
                    child: const Text('Siguiente'),
                  ),
                if (_step == 2)
                  ElevatedButton(
                    onPressed: _submitting ? null : _submit,
                    child: _submitting
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : const Text('Enviar Solicitud'),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStep() {
    switch (_step) {
      case 0:
        return _stepTipo();
      case 1:
        return _stepDetalle();
      case 2:
        return _stepConfirm();
      default:
        return const SizedBox();
    }
  }

  Widget _stepTipo() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Tipo de Solicitud',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        const Text(
          '¿Qué tipo de atención necesitas?',
          style: TextStyle(color: AppTheme.textSecondary),
        ),
        const SizedBox(height: 24),
        _tipoCard(
          'consulta',
          Icons.medical_services,
          'Consulta Médica',
          'Necesito ver a un médico por un problema de salud',
          AppTheme.primary,
        ),
        const SizedBox(height: 12),
        _tipoCard(
          'control',
          Icons.track_changes,
          'Control / Seguimiento',
          'Tengo una cita de control pendiente',
          AppTheme.accent,
        ),
        const SizedBox(height: 12),
        _tipoCard(
          'examen',
          Icons.science,
          'Resultado de Examen',
          'Necesito revisar resultados de exámenes',
          AppTheme.warning,
        ),
      ],
    );
  }

  Widget _tipoCard(
    String value,
    IconData icon,
    String title,
    String subtitle,
    Color color,
  ) {
    final selected = _ruta == value;
    return InkWell(
      onTap: () => setState(() => _ruta = value),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          border: Border.all(
            color: selected ? color : AppTheme.divider,
            width: selected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(16),
          color: selected ? color.withValues(alpha: 0.05) : null,
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 28),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 16,
                      color: selected ? color : null,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            if (selected) Icon(Icons.check_circle, color: color),
          ],
        ),
      ),
    );
  }

  Widget _stepDetalle() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Detalles',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 24),
        const Text(
          'Motivo de la solicitud',
          style: TextStyle(fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _motivoCtrl,
          maxLines: 3,
          decoration: const InputDecoration(
            hintText: 'Describe brevemente por qué necesitas la cita...',
          ),
        ),
        const SizedBox(height: 20),
        const Text(
          'Síntomas (opcional)',
          style: TextStyle(fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _sintomasCtrl,
          maxLines: 3,
          decoration: const InputDecoration(
            hintText: 'Dolor de cabeza, fiebre, etc...',
          ),
        ),
      ],
    );
  }

  Widget _stepConfirm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Confirmar Solicitud',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 24),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _row(
                  'Tipo',
                  _ruta == 'consulta'
                      ? 'Consulta Médica'
                      : _ruta == 'control'
                      ? 'Control'
                      : 'Resultado Examen',
                ),
                const Divider(),
                _row(
                  'Motivo',
                  _motivoCtrl.text.isEmpty
                      ? 'No especificado'
                      : _motivoCtrl.text,
                ),
                if (_sintomasCtrl.text.isNotEmpty) ...[
                  const Divider(),
                  _row('Síntomas', _sintomasCtrl.text),
                ],
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppTheme.warning.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: const Row(
            children: [
              Icon(Icons.info_outline, color: AppTheme.warning, size: 20),
              SizedBox(width: 10),
              Expanded(
                child: Text(
                  'Un médico revisará tu solicitud y agendará la cita. Recibirás una notificación.',
                  style: TextStyle(fontSize: 13),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _row(String l, String v) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 4),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 80,
          child: Text(
            l,
            style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
          ),
        ),
        Expanded(
          child: Text(v, style: const TextStyle(fontWeight: FontWeight.w500)),
        ),
      ],
    ),
  );
}
