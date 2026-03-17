import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../services/medico_service.dart';

class MedicoAtencionScreen extends StatefulWidget {
  final int idCita;
  const MedicoAtencionScreen({super.key, required this.idCita});
  @override
  State<MedicoAtencionScreen> createState() => _MedicoAtencionScreenState();
}

class _MedicoAtencionScreenState extends State<MedicoAtencionScreen> {
  final MedicoService _service = MedicoService();
  Map<String, dynamic>? _cita;
  bool _loading = true;
  bool _submitting = false;
  int _step = 0;

  // Form
  final _diagnosticoCtrl = TextEditingController();
  final _planCtrl = TextEditingController();
  final _recomendacionesCtrl = TextEditingController();
  final _pesoCtrl = TextEditingController();
  final _alturaCtrl = TextEditingController();
  final _presionCtrl = TextEditingController();
  final _fcCtrl = TextEditingController();
  final _tempCtrl = TextEditingController();
  bool _requiereSeg = false;

  @override
  void initState() {
    super.initState();
    _loadCita();
  }

  @override
  void dispose() {
    _diagnosticoCtrl.dispose();
    _planCtrl.dispose();
    _recomendacionesCtrl.dispose();
    _pesoCtrl.dispose();
    _alturaCtrl.dispose();
    _presionCtrl.dispose();
    _fcCtrl.dispose();
    _tempCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadCita() async {
    try {
      _cita = await _service.getCitaById(widget.idCita);
    } catch (e) {
      debugPrint('Error: $e');
    }
    setState(() => _loading = false);
  }

  Future<void> _submit() async {
    if (_diagnosticoCtrl.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('El diagnóstico es requerido'),
          backgroundColor: AppTheme.error,
        ),
      );
      return;
    }
    setState(() => _submitting = true);
    try {
      await _service.crearAtencion({
        'idCita': widget.idCita,
        'idMedico': _cita?['id_medico'],
        'diagnosticoPrincipal': _diagnosticoCtrl.text,
        'planTratamiento': _planCtrl.text,
        'recomendaciones': _recomendacionesCtrl.text,
        'requiereSeguimiento': _requiereSeg,
        'pesoKg': double.tryParse(_pesoCtrl.text),
        'alturaM': double.tryParse(_alturaCtrl.text),
        'presionArterial': _presionCtrl.text.isEmpty ? null : _presionCtrl.text,
        'frecuenciaCardiaca': int.tryParse(_fcCtrl.text),
        'temperaturaC': double.tryParse(_tempCtrl.text),
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✅ Atención registrada'),
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
      appBar: AppBar(title: const Text('Atención Médica')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _cita == null
          ? const Center(child: Text('Cita no encontrada'))
          : Column(
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
                              : const Text('Registrar Atención'),
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
        return _stepPaciente();
      case 1:
        return _stepSignos();
      case 2:
        return _stepDiagnostico();
      default:
        return const SizedBox();
    }
  }

  Widget _stepPaciente() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Datos del Paciente',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _infoRow('Paciente', _cita?['paciente_nombre'] ?? 'N/A'),
                _infoRow('Carnet', _cita?['paciente_carnet'] ?? 'N/A'),
                _infoRow(
                  'Fecha Cita',
                  _cita?['fecha_cita']?.toString().substring(0, 10) ?? '',
                ),
                _infoRow('Hora', _cita?['hora_cita'] ?? ''),
                _infoRow(
                  'Motivo',
                  _cita?['motivo_resumen'] ??
                      _cita?['motivo_consulta'] ??
                      'N/A',
                ),
                if (_cita?['codigo_caso'] != null)
                  _infoRow('Caso', _cita!['codigo_caso']),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Container(
              width: 12,
              height: 12,
              decoration: BoxDecoration(
                color: AppTheme.semaforoColor(
                  _cita?['paciente_semaforo'] ??
                      _cita?['nivel_semaforo_paciente'],
                ),
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 8),
            Text(
              'Semáforo: ${AppTheme.semaforoLabel(_cita?['paciente_semaforo'] ?? _cita?['nivel_semaforo_paciente'])}',
              style: const TextStyle(fontWeight: FontWeight.w500),
            ),
          ],
        ),
      ],
    );
  }

  Widget _stepSignos() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Signos Vitales',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _pesoCtrl,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Peso (kg)',
                  prefixIcon: Icon(Icons.monitor_weight),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: TextField(
                controller: _alturaCtrl,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Altura (m)',
                  prefixIcon: Icon(Icons.height),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _presionCtrl,
          decoration: const InputDecoration(
            labelText: 'Presión Arterial',
            hintText: '120/80',
            prefixIcon: Icon(Icons.bloodtype),
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _fcCtrl,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'F. Cardíaca (bpm)',
                  prefixIcon: Icon(Icons.favorite),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: TextField(
                controller: _tempCtrl,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Temp. (°C)',
                  prefixIcon: Icon(Icons.thermostat),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _stepDiagnostico() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Diagnóstico y Tratamiento',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _diagnosticoCtrl,
          maxLines: 3,
          decoration: const InputDecoration(
            labelText: 'Diagnóstico Principal *',
            hintText: 'Escriba el diagnóstico...',
          ),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _planCtrl,
          maxLines: 3,
          decoration: const InputDecoration(
            labelText: 'Plan de Tratamiento',
            hintText: 'Medicamentos, dosis, frecuencia...',
          ),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _recomendacionesCtrl,
          maxLines: 2,
          decoration: const InputDecoration(
            labelText: 'Recomendaciones',
            hintText: 'Reposo, dieta, etc...',
          ),
        ),
        const SizedBox(height: 16),
        SwitchListTile(
          value: _requiereSeg,
          onChanged: (v) => setState(() => _requiereSeg = v),
          title: const Text('Requiere Seguimiento'),
          subtitle: const Text('Se programará una cita de control'),
          activeThumbColor: AppTheme.primary,
          contentPadding: EdgeInsets.zero,
        ),
      ],
    );
  }

  Widget _infoRow(String l, String v) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 3),
    child: Row(
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
