import { createBrowserRouter, Navigate } from "react-router-dom";
import LandingVacantesImpactPage from "../modules/publico/pages/LandingVacantesImpactPage";
import VacantesSearchPage from "../modules/publico/pages/VacantesSearchPage";
import VacanteDetallePage from "../modules/publico/pages/VacanteDetallePage";
import SinAccesoPage from "../modules/publico/pages/SinAccesoPage";
import LoginCandidatoPage from "../modules/auth/pages/LoginCandidatoPage";
import PortalLoginRedirectPage from "../modules/auth/pages/PortalLoginRedirectPage";
import RegistroCandidatoImpactPage from "../modules/auth/pages/RegistroCandidatoImpactPage";
import MiPerfilPage from "../modules/candidato/pages/MiPerfilPage";
import MiCvPage from "../modules/candidato/pages/MiCvPage";
import MisPostulacionesPage from "../modules/candidato/pages/MisPostulacionesPage";
import RhDashboardPage from "../modules/rh/pages/RhDashboardPage";
import RhVacantesPage from "../modules/rh/pages/RhVacantesPage";
import RhVacanteDetallePage from "../modules/rh/pages/RhVacanteDetallePage";
import RhVacanteFormPage from "../modules/rh/pages/RhVacanteFormPage";
import RhPostulacionesPage from "../modules/rh/pages/RhPostulacionesPage";
import RhCandidatoDetallePage from "../modules/rh/pages/RhCandidatoDetallePage";
import RhTernaPage from "../modules/rh/pages/RhTernaPage";
import RhListaNegraPage from "../modules/rh/pages/RhListaNegraPage";
import RhReportesPage from "../modules/rh/pages/RhReportesPage";
import RhRequisicionesPage from "../modules/rh/pages/RhRequisicionesPage";
import RhDescriptoresPage from "../modules/rh/pages/RhDescriptoresPage";
import ForgotPasswordPage from "../modules/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "../modules/auth/pages/ResetPasswordPage";
import SSOHandlerPage from "../modules/auth/pages/SSOHandlerPage";
import AuthGuard from "../shared/guards/AuthGuard";
import CandidateGuard from "../shared/guards/CandidateGuard";
import PermisoGuard from "../shared/guards/PermisoGuard";

export const router = createBrowserRouter([
  { path: "/empleos", element: <LandingVacantesImpactPage /> },
  { path: "/", element: <Navigate to="/empleos" replace /> },
  { path: "/vacantes", element: <VacantesSearchPage /> },
  { path: "/vacantes/:slug", element: <VacanteDetallePage /> },
  { path: "/login", element: <LoginCandidatoPage /> },
  { path: "/login-empleado", element: <PortalLoginRedirectPage /> },
  { path: "/auth/sso", element: <SSOHandlerPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  { path: "/registro", element: <RegistroCandidatoImpactPage /> },
  { path: "/sin-acceso", element: <SinAccesoPage /> },
  { path: "/app/vacantes/perfil", element: <CandidateGuard><MiPerfilPage /></CandidateGuard> },
  { path: "/app/vacantes/cv", element: <CandidateGuard><MiCvPage /></CandidateGuard> },
  { path: "/app/vacantes/mis-postulaciones", element: <CandidateGuard><MisPostulacionesPage /></CandidateGuard> },
  { path: "/app/vacantes/rh/dashboard", element: <PermisoGuard rhOnly><RhDashboardPage /></PermisoGuard> },
  { path: "/app/vacantes/rh/vacantes", element: <PermisoGuard rhOnly><RhVacantesPage /></PermisoGuard> },
  { path: "/app/vacantes/rh/vacante/:id", element: <PermisoGuard rhOnly><RhVacanteDetallePage /></PermisoGuard> },
  { path: "/app/vacantes/rh/vacantes/nueva", element: <PermisoGuard rhOnly><RhVacanteFormPage /></PermisoGuard> },
  { path: "/app/vacantes/rh/requisiciones", element: <PermisoGuard rhOnly><RhRequisicionesPage /></PermisoGuard> },
  { path: "/app/vacantes/rh/descriptores", element: <PermisoGuard rhOnly><RhDescriptoresPage /></PermisoGuard> },
  { path: "/app/vacantes/rh/postulaciones", element: <PermisoGuard rhOnly><RhPostulacionesPage /></PermisoGuard> },
  { path: "/app/vacantes/rh/candidato/:id", element: <PermisoGuard rhOnly><RhCandidatoDetallePage /></PermisoGuard> },
  { path: "/app/vacantes/rh/terna", element: <PermisoGuard rhOnly><RhTernaPage /></PermisoGuard> },
  { path: "/app/vacantes/rh/lista-negra", element: <PermisoGuard rhOnly><RhListaNegraPage /></PermisoGuard> },
  { path: "/app/vacantes/rh/reportes", element: <PermisoGuard rhOnly><RhReportesPage /></PermisoGuard> }
]);