import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'core/auth_provider.dart';
import 'core/theme.dart';
import 'screens/login_screen.dart';
// Admin
import 'screens/admin/admin_dashboard_screen.dart';
import 'screens/admin/admin_usuarios_screen.dart';
// Medico
import 'screens/medico/medico_dashboard_screen.dart';
import 'screens/medico/medico_pacientes_screen.dart';
import 'screens/medico/medico_casos_screen.dart';
import 'screens/medico/medico_agenda_screen.dart';
import 'screens/medico/medico_atencion_screen.dart';
// Paciente
import 'screens/paciente/paciente_dashboard_screen.dart';
import 'screens/paciente/paciente_mis_citas_screen.dart';
import 'screens/paciente/paciente_chequeo_screen.dart';
import 'screens/paciente/paciente_solicitar_cita_screen.dart';
import 'screens/paciente/paciente_historial_screen.dart';
import 'screens/paciente/paciente_examenes_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    ChangeNotifierProvider(
      create: (_) => AuthProvider(),
      child: const ClinicaApp(),
    ),
  );
}

class ClinicaApp extends StatelessWidget {
  const ClinicaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Claro Mi Salud',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: Consumer<AuthProvider>(
        builder: (_, auth, _) {
          if (auth.loading) {
            return const _SplashScreen();
          }
          if (!auth.isAuthenticated) {
            return const LoginScreen();
          }
          switch (auth.rol) {
            case 'ADMIN':
              return const AdminDashboardScreen();
            case 'MEDICO':
              return const MedicoDashboardScreen();
            case 'PACIENTE':
              return const PacienteDashboardScreen();
            default:
              return const LoginScreen();
          }
        },
      ),
      onGenerateRoute: (settings) {
        // Handle routes with arguments
        switch (settings.name) {
          case '/medico/atencion':
            final idCita = settings.arguments as int? ?? 0;
            return MaterialPageRoute(
              builder: (_) => MedicoAtencionScreen(idCita: idCita),
            );
          default:
            break;
        }
        return null;
      },
      routes: {
        // Admin
        '/admin/dashboard': (_) => const AdminDashboardScreen(),
        '/admin/usuarios': (_) => const AdminUsuariosScreen(),
        // Medico
        '/medico/dashboard': (_) => const MedicoDashboardScreen(),
        '/medico/pacientes': (_) => const MedicoPacientesScreen(),
        '/medico/casos': (_) => const MedicoCasosScreen(),
        '/medico/agenda': (_) => const MedicoAgendaScreen(),
        // Paciente
        '/paciente/dashboard': (_) => const PacienteDashboardScreen(),
        '/paciente/citas': (_) => const PacienteMisCitasScreen(),
        '/paciente/chequeo': (_) => const PacienteChequeoScreen(),
        '/paciente/solicitar-cita': (_) => const PacienteSolicitarCitaScreen(),
        '/paciente/chequeos': (_) => const PacienteHistorialScreen(),
        '/paciente/examenes': (_) => const PacienteExamenesScreen(),
      },
    );
  }
}

class _SplashScreen extends StatelessWidget {
  const _SplashScreen();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFF0066CC), Color(0xFF003366)],
          ),
        ),
        child: const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.local_hospital_rounded, size: 80, color: Colors.white),
              SizedBox(height: 20),
              Text(
                'Claro Mi Salud',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  letterSpacing: 1.5,
                ),
              ),
              SizedBox(height: 8),
              Text(
                'Sistema de Salud Ocupacional',
                style: TextStyle(fontSize: 14, color: Colors.white70),
              ),
              SizedBox(height: 40),
              CircularProgressIndicator(color: Colors.white),
            ],
          ),
        ),
      ),
    );
  }
}
