"use client";

import { useAuth } from './use-auth';
import { UsuarioAplicacion, Pais, Rol } from '@/lib/types/domain';

export const useUserProfile = () => {
  const { user, loading, pais, setPais, switchRole } = useAuth();

  return {
    userProfile: user,
    loading,
    pais,
    setPais,
    switchRole,
    // Deprecated, use userProfile directly
    id: user?.id_usuario,
    idPaciente: user?.id_paciente,
    idMedico: user?.id_medico,
    rol: user?.rol,
    nombreCompleto: user?.nombre_completo,
    carnet: user?.carnet,
  };
};
