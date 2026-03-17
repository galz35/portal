import api from '../api';
import { CitaMedica, Paciente, EmpleadoEmp2024, CasoClinico } from '../types/domain';

export interface MedicoDashboardData {
    citasHoyCount: number;
    citasHoy: any[];
    pacientesEnRojoCount: number;
    pacientesEnRojo: any[];
    casosAbiertos: number;
}

export type AtencionPageData = {
    cita: CitaMedica;
    paciente: Paciente;
    empleado: EmpleadoEmp2024;
    caso: CasoClinico;
};

export const MedicoService = {
    getDashboard: async (): Promise<MedicoDashboardData> => {
        const response = await api.get('/medico/dashboard');
        return response.data;
    },

    getAgendaCitas: async () => {
        const response = await api.get('/medico/agenda-citas');
        return response.data;
    },

    agendarCita: async (data: any) => {
        const response = await api.post('/medico/agenda-citas/agendar', data);
        return response.data;
    },

    crearAtencion: async (data: any) => {
        const response = await api.post('/medico/atencion', data);
        return response.data;
    },

    getPacientes: async (pais?: string) => {
        const response = await api.get('/medico/pacientes', { params: { pais } });
        return response.data;
    },

    getChequeosPorPaciente: async (id: number) => {
        const response = await api.get(`/medico/pacientes/${id}/chequeos`);
        return response.data;
    },

    getCitasPorPaciente: async (id: number) => {
        const response = await api.get(`/medico/pacientes/${id}/citas`);
        return response.data;
    },

    getExamenesPorPaciente: async (id: number) => {
        const response = await api.get(`/medico/pacientes/${id}/examenes`);
        return response.data;
    },

    getVacunasPorPaciente: async (id: number) => {
        const response = await api.get(`/medico/pacientes/${id}/vacunas`);
        return response.data;
    },

    getExamenes: async (params?: { pais?: string }) => {
        const response = await api.get('/medico/examenes', { params });
        return response.data;
    },

    getSeguimientos: async (params?: { pais?: string }) => {
        const response = await api.get('/medico/seguimientos', { params });
        return response.data;
    },

    updateSeguimiento: async (id: number, data: any) => {
        const response = await api.patch(`/medico/seguimientos/${id}`, data);
        return response.data;
    },

    getCitaById: async (id: string) => {
        const response = await api.get(`/medico/citas/${id}`);
        return response.data;
    },

    getAtencionMedicaData: async (citaId: string): Promise<AtencionPageData> => {
        const cita = await MedicoService.getCitaById(citaId);
        return {
            cita: cita,
            paciente: cita.paciente,
            empleado: cita.medico,
            caso: cita.caso
        };
    },

    getCitasPorMedico: async (idMedico: string, params?: { pais?: string }) => {
        // Assuming backend endpoint exists or we filter client side if needed
        // Ideally backend should have /medico/citas or /medico/:id/citas
        // Let's assume /medico/citas returns citas for the logged in doctor if no ID provided, 
        // or we pass it as query param
        const response = await api.get('/medico/citas', { params: { ...params, idMedico } });
        return response.data;
    },

    registrarVacuna: async (data: any) => {
        const response = await api.post('/medico/vacunas', data);
        return response.data;
    },

    updateExamen: async (id: number | string, data: { resultadoResumen: string; estadoExamen?: string }) => {
        const response = await api.patch(`/medico/examenes/${id}`, data);
        return response.data;
    },

    getReporteAtencion: async (idAtencion: number) => {
        const response = await api.get(`/medico/reporte-atencion/${idAtencion}`);
        return response.data;
    },

    getReportePaciente: async (idPaciente: number) => {
        const response = await api.get(`/medico/reporte-paciente/${idPaciente}`);
        return response.data;
    },

    getRegistrosPsicosociales: async (pais?: string) => {
        const response = await api.get('/medico/psicosocial', { params: { pais } });
        return response.data;
    },

    crearRegistroPsicosocial: async (data: any) => {
        const response = await api.post('/medico/psicosocial', data);
        return response.data;
    }
};
