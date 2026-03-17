import { Link, useLocation } from "react-router-dom";
import {
  HeartPulse,
  LayoutDashboard,
  ClipboardList,
  Calendar,
  Users,
  Settings,
  FlaskConical,
  Repeat,
  BookUser,
  CalendarPlus,
  BarChart3,
  CalendarDays,
  Stethoscope,
  X,
  BookOpen,
  Syringe,
  Users2,
  BrainCircuit,
  LayoutGrid,
} from "lucide-react";

import { useUserProfile } from "@/hooks/use-user-profile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isCollapsed: boolean;
}

const NavItem = ({ href, icon: Icon, label, isCollapsed }: NavItemProps) => {
  const { pathname } = useLocation();
  const isActive = pathname.startsWith(href);

  const linkContent = (
    <div
      className={cn(
        "flex items-center w-full h-11 px-3 rounded-xl transition-all duration-200 group",
        isActive 
          ? "bg-red-50 text-[#DA291C]" 
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      <Icon className={cn("h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110", isActive && "text-[#DA291C]")} />
      {!isCollapsed && <span className="ml-3 font-semibold text-[13.5px]">{label}</span>}
      {isActive && !isCollapsed && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#DA291C]"></div>
      )}
    </div>
  );

  return (
    <li>
      {isCollapsed ? (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to={href}>{linkContent}</Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-[#0f172a] text-white border-none text-[12px] font-bold">
              <p>{label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <Link to={href}>{linkContent}</Link>
      )}
    </li>
  );
};


const pacienteMenu = [
  { href: "/paciente/dashboard", icon: LayoutDashboard, label: "Panel Principal" },
  { href: "/paciente/solicitar-cita", icon: CalendarPlus, label: "Nueva Cita" },
  { href: "/paciente/psicosocial", icon: BrainCircuit, label: "Salud Mental" },
  { href: "/paciente/mis-citas", icon: Calendar, label: "Mis Citas" },
  { href: "/paciente/historial-chequeos", icon: ClipboardList, label: "Mis Chequeos" },
  { href: "/paciente/mis-examenes", icon: FlaskConical, label: "Laboratorio" },
  { href: "/paciente/mis-vacunas", icon: Syringe, label: "Vacunación" },
];

const medicoMenu = [
  { href: "/medico/dashboard", icon: LayoutDashboard, label: "Escritorio" },
  { href: "/medico/agenda-citas", icon: CalendarPlus, label: "Gestión Citas" },
  { href: "/medico/agenda-calendario", icon: CalendarDays, label: "Calendario" },
  { href: "/medico/pacientes-casos", icon: BookUser, label: "Mis Pacientes" },
  { href: "/medico/psicosocial", icon: BrainCircuit, label: "Evaluación Psico" },
  { href: "/medico/examenes", icon: FlaskConical, label: "Exámenes" },
  { href: "/medico/seguimientos", icon: Repeat, label: "Seguimiento" },
  { href: "/medico/registro-vacunas", icon: Syringe, label: "Vacunación" },
  { href: "/medico/analisis-ia", icon: BrainCircuit, label: "Central IA" },
  { href: "/medico/reportes", icon: BarChart3, label: "Estadísticas" },
];

const adminMenu = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Global" },
  { href: "/admin/gestion-usuarios", icon: Users, label: "Cuentas" },
  { href: "/admin/gestion-empleados", icon: Users2, label: "Colaboradores" },
  { href: "/admin/gestion-medicos", icon: Stethoscope, label: "Personal Médico" },
  { href: "/admin/psicosocial", icon: BrainCircuit, label: "Módulo Psico" },
  { href: "/admin/reportes", icon: BarChart3, label: "Análisis Corporativo" },
  { href: "/admin/configuracion", icon: Settings, label: "Ajustes Sistema" },
];

const commonMenu = [
  { href: "/tutorial", icon: BookOpen, label: "Ayuda y Soporte" },
];


export function Sidebar({ isCollapsed, toggleSidebar }: { isCollapsed: boolean, toggleSidebar: () => void }) {
  const { userProfile } = useUserProfile();
  const isMobile = useIsMobile();

  const getMenu = () => {
    if (!userProfile) return [];
    switch (userProfile?.rol) {
      case "PACIENTE": return pacienteMenu;
      case "MEDICO": return medicoMenu;
      case "ADMIN": return adminMenu;
      default: return [];
    }
  };

  const menuItems = getMenu();

  return (
    <div className="flex h-full flex-col bg-white border-r border-slate-100 transition-all duration-300 ease-in-out font-sans">
      <div className={cn(
        "flex h-20 items-center border-b border-slate-50", 
        isCollapsed && !isMobile ? 'justify-center' : 'px-6 justify-between'
      )}>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#DA291C] rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
             <HeartPulse className="h-6 w-6 text-white" />
          </div>
          {(!isCollapsed || isMobile) && (
            <div className="flex flex-col">
              <span className="font-extrabold text-[#0f172a] text-lg leading-tight tracking-tight">ClaroSalud</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest -mt-0.5">Medical Hub</span>
            </div>
          )}
        </Link>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-slate-400 hover:bg-slate-50">
            <X className="h-6 w-6" />
          </Button>
        )}
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <ul className="space-y-1.5">
          <li className={cn("px-3 mb-2", isCollapsed && !isMobile ? "text-center" : "")}>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Navegación</span>
          </li>
          {menuItems.map((item) => (
            <NavItem key={item.href} {...item} isCollapsed={isCollapsed && !isMobile} />
          ))}
        </ul>

        <div className="my-6 px-3">
           <div className="h-px bg-slate-100 w-full"></div>
        </div>

        <ul className="space-y-1.5">
          <li className={cn("px-3 mb-2", isCollapsed && !isMobile ? "text-center" : "")}>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Utilidades</span>
          </li>
          {commonMenu.map((item) => (
            <NavItem key={item.href} {...item} isCollapsed={isCollapsed && !isMobile} />
          ))}
        </ul>
      </nav>

      {!isCollapsed && (
        <div className="p-4 m-4 bg-slate-50 rounded-2xl border border-slate-100">
           <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Tu Salud Primero</p>
           <p className="text-[12px] text-slate-600 font-medium">Contamos con +20 expertos listos para atenderte.</p>
        </div>
      )}
    </div>
  );
}
