import React, { useState, useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useAuth } from "@/hooks/use-auth";
import { useUserProfile } from "@/hooks/use-user-profile";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import { HeartPulse } from "lucide-react";

export default function MainLayout() {
  const { user, loading: authLoading } = useAuth();
  const { userProfile, loading: profileLoading } = useUserProfile();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
      setSidebarOpen(false);
    } else {
      setSidebarCollapsed(false);
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    if (isMobile) setSidebarOpen(!isSidebarOpen);
    else {
      setSidebarCollapsed(!isSidebarCollapsed);
      setSidebarOpen(true);
    }
  };

  const loading = authLoading || profileLoading;

  if (loading || !user || !userProfile) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-[#F8FAFC]">
        <div className="relative">
          <motion.div 
            animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="w-24 h-24 bg-[#DA291C] rounded-[32px] flex items-center justify-center shadow-[0_20px_50px_rgba(218,41,28,0.3)] mb-10 relative z-10"
          >
            <HeartPulse size={48} color="#fff" />
          </motion.div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
        </div>
        <h2 className="text-3xl font-black text-[#0F172A] tracking-tighter">Claro Salud</h2>
        <p className="text-sm font-bold text-slate-400 mt-3 uppercase tracking-widest">Sincronizando información médica...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden antialiased">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm" 
            onClick={toggleSidebar} 
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 h-full bg-white flex flex-col transition-all duration-300 ease-in-out md:relative md:translate-x-0 border-r border-slate-100 shadow-sm",
          isMobile && (isSidebarOpen ? "translate-x-0 w-72" : "-translate-x-full w-72"),
          !isMobile && (isSidebarCollapsed ? "w-20" : "w-72")
        )}
      >
        <Sidebar isCollapsed={isMobile ? false : isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10 custom-scrollbar">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
