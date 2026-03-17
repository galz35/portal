import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/lib/context/AuthContext'
import { Toaster } from '@/components/ui/toaster'
import { HeartPulse } from 'lucide-react'
import './globals.css'

// Layouts
import MainLayout from './app/(main)/layout'

// Auth Pages
import LoginPage from './app/(auth)/login/page'
import SSOHandlerPage from './app/(auth)/sso/page'

// Common Components for missing pages
const ComingSoon = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
    <div className="w-24 h-24 bg-slate-100 rounded-[32px] flex items-center justify-center text-[#DA291C] animate-bounce">
       <HeartPulse size={48} />
    </div>
    <div>
      <h2 className="text-3xl font-black text-[#0F172A]">{title}</h2>
      <p className="text-slate-500 font-medium mt-2">Estamos preparando esta sección para brindarte la mejor experiencia técnica.</p>
    </div>
  </div>
);

// Admin Pages
import DashboardAdminPage from './app/(main)/admin/dashboard/page'
import GestionUsuariosPage from './app/(main)/admin/gestion-usuarios/page'
import GestionEmpleadosPage from './app/(main)/admin/gestion-empleados/page'
// Lazy load others to keep bundle small if they exist as folders
const GestionMedicosPage = lazy(() => import('./app/(main)/admin/gestion-medicos/page').catch(() => ({ default: () => <ComingSoon title="Gestión de Médicos" /> })));
const PsicosocialAdminPage = lazy(() => import('./app/(main)/admin/psicosocial/page').catch(() => ({ default: () => <ComingSoon title="Módulo Psicosocial" /> })));
const ReportesAdminPage = lazy(() => import('./app/(main)/admin/reportes/page').catch(() => ({ default: () => <ComingSoon title="Análisis Corporativo" /> })));
const ConfiguracionAdminPage = lazy(() => import('./app/(main)/admin/configuracion/page').catch(() => ({ default: () => <ComingSoon title="Ajustes del Sistema" /> })));

// Medico Pages
import DashboardMedicoPage from './app/(main)/medico/dashboard/page'
const AgendaCitasPage = lazy(() => import('./app/(main)/medico/agenda-citas/page').catch(() => ({ default: () => <ComingSoon title="Gestión de Citas" /> })));
const AgendaCalendarioPage = lazy(() => import('./app/(main)/medico/agenda-calendario/page').catch(() => ({ default: () => <ComingSoon title="Calendario Médico" /> })));
const PacientesCasosPage = lazy(() => import('./app/(main)/medico/pacientes-casos/page').catch(() => ({ default: () => <ComingSoon title="Mis Pacientes" /> })));
const PsicosocialMedicoPage = lazy(() => import('./app/(main)/medico/psicosocial/page').catch(() => ({ default: () => <ComingSoon title="Evaluación Psicosocial" /> })));
const ExamenesPage = lazy(() => import('./app/(main)/medico/examenes/page').catch(() => ({ default: () => <ComingSoon title="Exámenes de Laboratorio" /> })));
const SeguimientosPage = lazy(() => import('./app/(main)/medico/seguimientos/page').catch(() => ({ default: () => <ComingSoon title="Seguimiento de Casos" /> })));
const RegistroVacunasPage = lazy(() => import('./app/(main)/medico/registro-vacunas/page').catch(() => ({ default: () => <ComingSoon title="Registro de Vacunación" /> })));
const AnalisisIaPage = lazy(() => import('./app/(main)/medico/analisis-ia/page').catch(() => ({ default: () => <ComingSoon title="Inteligencia Artificial" /> })));
const ReportesMedicoPage = lazy(() => import('./app/(main)/medico/reportes/page').catch(() => ({ default: () => <ComingSoon title="Reportes Médicos" /> })));
const AtencionCitaPage = lazy(() => import('./app/(main)/medico/atencion/[idCita]/page').catch(() => ({ default: () => <ComingSoon title="Atención de Consulta" /> })));

// Paciente Pages
import DashboardPacientePage from './app/(main)/paciente/dashboard/page'
const SolicitarCitaPage = lazy(() => import('./app/(main)/paciente/solicitar-cita/page').catch(() => ({ default: () => <ComingSoon title="Nueva Cita Médica" /> })));
const MisCitasPage = lazy(() => import('./app/(main)/paciente/mis-citas/page').catch(() => ({ default: () => <ComingSoon title="Mis Citas Programadas" /> })));
const HistorialChequeosPage = lazy(() => import('./app/(main)/paciente/historial-chequeos/page').catch(() => ({ default: () => <ComingSoon title="Historial de Chequeos" /> })));
const MisExamenesPage = lazy(() => import('./app/(main)/paciente/mis-examenes/page').catch(() => ({ default: () => <ComingSoon title="Mis Exámenes de Laboratorio" /> })));
const MisVacunasPage = lazy(() => import('./app/(main)/paciente/mis-vacunas/page').catch(() => ({ default: () => <ComingSoon title="Mi Cartilla de Vacunación" /> })));
const PsicosocialPacientePage = lazy(() => import('./app/(main)/paciente/psicosocial/page').catch(() => ({ default: () => <ComingSoon title="Salud Mental" /> })));

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={
          <div className="flex flex-col h-screen w-full items-center justify-center bg-[#F8FAFC]">
            <HeartPulse size={48} className="text-[#DA291C] animate-pulse" />
          </div>
        }>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/sso" element={<SSOHandlerPage />} />
            
            <Route element={<MainLayout />}>
               {/* Admin Routes */}
               <Route path="/admin/dashboard" element={<DashboardAdminPage />} />
               <Route path="/admin/gestion-usuarios" element={<GestionUsuariosPage />} />
               <Route path="/admin/gestion-empleados" element={<GestionEmpleadosPage />} />
               <Route path="/admin/gestion-medicos" element={<GestionMedicosPage />} />
               <Route path="/admin/psicosocial" element={<PsicosocialAdminPage />} />
               <Route path="/admin/reportes" element={<ReportesAdminPage />} />
               <Route path="/admin/configuracion" element={<ConfiguracionAdminPage />} />

               {/* Medico Routes */}
               <Route path="/medico/dashboard" element={<DashboardMedicoPage />} />
               <Route path="/medico/agenda-citas" element={<AgendaCitasPage />} />
               <Route path="/medico/agenda-calendario" element={<AgendaCalendarioPage />} />
               <Route path="/medico/pacientes-casos" element={<PacientesCasosPage />} />
               <Route path="/medico/psicosocial" element={<PsicosocialMedicoPage />} />
               <Route path="/medico/examenes" element={<ExamenesPage />} />
               <Route path="/medico/seguimientos" element={<SeguimientosPage />} />
               <Route path="/medico/registro-vacunas" element={<RegistroVacunasPage />} />
               <Route path="/medico/analisis-ia" element={<AnalisisIaPage />} />
               <Route path="/medico/reportes" element={<ReportesMedicoPage />} />
               <Route path="/medico/atencion/:id" element={<AtencionCitaPage />} />

               {/* Paciente Routes */}
               <Route path="/paciente/dashboard" element={<DashboardPacientePage />} />
               <Route path="/paciente/solicitar-cita" element={<SolicitarCitaPage />} />
               <Route path="/paciente/mis-citas" element={<MisCitasPage />} />
               <Route path="/paciente/historial-chequeos" element={<HistorialChequeosPage />} />
               <Route path="/paciente/mis-examenes" element={<MisExamenesPage />} />
               <Route path="/paciente/mis-vacunas" element={<MisVacunasPage />} />
               <Route path="/paciente/psicosocial" element={<PsicosocialPacientePage />} />

               {/* Help */}
               <Route path="/tutorial" element={<ComingSoon title="Ayuda y Soporte" />} />
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
