import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../services/paciente_service.dart';

class PacienteChequeoScreen extends StatefulWidget {
  const PacienteChequeoScreen({super.key});
  @override
  State<PacienteChequeoScreen> createState() => _PacienteChequeoScreenState();
}

class _PacienteChequeoScreenState extends State<PacienteChequeoScreen> {
  final PacienteService _service = PacienteService();
  int _step = 0;
  bool _submitting = false;

  // Form data
  String _estadoAnimo = 'Bien';
  String _nivelEstres = 'Bajo';
  String _calidadSueno = 'Buena';
  String _consumoAgua = '4-6 vasos';
  String _nivelRiesgo = 'Bajo';
  final _comentarioCtrl = TextEditingController();

  final _estresOptions = ['Bajo', 'Medio', 'Alto'];
  final _suenoOptions = ['Excelente', 'Buena', 'Regular', 'Mala'];
  final _aguaOptions = ['1-3 vasos', '4-6 vasos', '7-8 vasos', 'Más de 8'];

  @override
  void dispose() {
    _comentarioCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() => _submitting = true);
    try {
      await _service.crearChequeo({
        'estadoAnimo': _estadoAnimo,
        'nivelEstres': _nivelEstres,
        'calidadSueno': _calidadSueno,
        'consumoAgua': _consumoAgua,
        'nivelRiesgo': _nivelRiesgo,
        'comentarioGeneral': _comentarioCtrl.text,
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✅ Chequeo registrado exitosamente'),
            backgroundColor: AppTheme.success,
          ),
        );
        Navigator.pop(context);
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
      appBar: AppBar(title: const Text('Chequeo de Bienestar')),
      body: Column(
        children: [
          // Progress
          LinearProgressIndicator(
            value: (_step + 1) / 4,
            backgroundColor: AppTheme.divider,
            color: AppTheme.primary,
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 300),
                child: _buildStep(),
              ),
            ),
          ),
          // Navigation
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
                if (_step < 3)
                  ElevatedButton(
                    onPressed: () => setState(() => _step++),
                    child: const Text('Siguiente'),
                  ),
                if (_step == 3)
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
                        : const Text('Enviar Chequeo'),
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
        return _stepAnimo();
      case 1:
        return _stepFisico();
      case 2:
        return _stepRiesgo();
      case 3:
        return _stepResumen();
      default:
        return const SizedBox();
    }
  }

  Widget _stepAnimo() {
    return Column(
      key: const ValueKey('animo'),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          '¿Cómo te sientes hoy?',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        const Text(
          'Selecciona tu estado de ánimo actual',
          style: TextStyle(color: AppTheme.textSecondary),
        ),
        const SizedBox(height: 24),
        ...['😄 Muy bien', '🙂 Bien', '😐 Regular', '😔 Mal', '😢 Muy mal'].map(
          (opt) {
            final val = opt.split(' ').skip(1).join(' ');
            return _optionTile(
              opt,
              val,
              _estadoAnimo,
              (v) => setState(() => _estadoAnimo = v),
            );
          },
        ),
        const SizedBox(height: 24),
        const Text(
          'Nivel de estrés',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 12),
        ..._estresOptions.map(
          (opt) => _optionTile(
            opt,
            opt,
            _nivelEstres,
            (v) => setState(() => _nivelEstres = v),
          ),
        ),
      ],
    );
  }

  Widget _stepFisico() {
    return Column(
      key: const ValueKey('fisico'),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Estado Físico',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        const Text(
          'Cuéntanos sobre tu descanso y hábitos',
          style: TextStyle(color: AppTheme.textSecondary),
        ),
        const SizedBox(height: 24),
        const Text(
          'Calidad de sueño',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 12),
        ..._suenoOptions.map(
          (opt) => _optionTile(
            opt,
            opt,
            _calidadSueno,
            (v) => setState(() => _calidadSueno = v),
          ),
        ),
        const SizedBox(height: 24),
        const Text(
          'Consumo de agua diario',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 12),
        ..._aguaOptions.map(
          (opt) => _optionTile(
            opt,
            opt,
            _consumoAgua,
            (v) => setState(() => _consumoAgua = v),
          ),
        ),
      ],
    );
  }

  Widget _stepRiesgo() {
    return Column(
      key: const ValueKey('riesgo'),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Evaluación de Riesgo',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 24),
        ...['Bajo', 'Medio', 'Alto'].map((opt) {
          final color = opt == 'Alto'
              ? AppTheme.error
              : opt == 'Medio'
              ? AppTheme.warning
              : AppTheme.success;
          return Container(
            margin: const EdgeInsets.only(bottom: 10),
            decoration: BoxDecoration(
              border: Border.all(
                color: _nivelRiesgo == opt ? color : AppTheme.divider,
                width: 2,
              ),
              borderRadius: BorderRadius.circular(12),
            ),
            child: RadioListTile<String>(
              value: opt,
              groupValue: _nivelRiesgo,
              onChanged: (v) => setState(() => _nivelRiesgo = v!),
              title: Text(
                opt,
                style: TextStyle(fontWeight: FontWeight.w600, color: color),
              ),
              activeColor: color,
            ),
          );
        }),
        const SizedBox(height: 20),
        const Text(
          'Comentarios adicionales',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _comentarioCtrl,
          maxLines: 4,
          decoration: const InputDecoration(
            hintText: 'Describe cualquier síntoma o malestar...',
          ),
        ),
      ],
    );
  }

  Widget _stepResumen() {
    return Column(
      key: const ValueKey('resumen'),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Resumen del Chequeo',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 24),
        _resumeRow('Estado de Ánimo', _estadoAnimo),
        _resumeRow('Nivel de Estrés', _nivelEstres),
        _resumeRow('Calidad de Sueño', _calidadSueno),
        _resumeRow('Consumo de Agua', _consumoAgua),
        _resumeRow('Nivel de Riesgo', _nivelRiesgo),
        if (_comentarioCtrl.text.isNotEmpty)
          _resumeRow('Comentario', _comentarioCtrl.text),
        const SizedBox(height: 20),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppTheme.primary.withValues(alpha: 0.05),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppTheme.primary.withValues(alpha: 0.2)),
          ),
          child: const Row(
            children: [
              Icon(Icons.info_outline, color: AppTheme.primary),
              SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Al enviar, tu chequeo será registrado y tu nivel de semáforo se actualizará.',
                  style: TextStyle(fontSize: 13),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _resumeRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          SizedBox(
            width: 140,
            child: Text(
              label,
              style: const TextStyle(color: AppTheme.textSecondary),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }

  Widget _optionTile(
    String label,
    String value,
    String groupValue,
    ValueChanged<String> onChanged,
  ) {
    final selected = groupValue == value;
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        border: Border.all(
          color: selected ? AppTheme.primary : AppTheme.divider,
          width: selected ? 2 : 1,
        ),
        borderRadius: BorderRadius.circular(12),
        color: selected ? AppTheme.primary.withValues(alpha: 0.05) : null,
      ),
      child: ListTile(
        title: Text(
          label,
          style: TextStyle(
            fontWeight: selected ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
        trailing: selected
            ? const Icon(Icons.check_circle, color: AppTheme.primary)
            : null,
        onTap: () => onChanged(value),
      ),
    );
  }
}
