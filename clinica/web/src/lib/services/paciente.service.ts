import api from '@/lib/api';

export interface DashboardData {
    kpis: {
        estadoActual: 'V' | 'A' | 'R';
        ultimoChequeo: string;
        proximaCita: string | null;
        seguimientosActivos: number;
    };
    ultimoChequeoData: any | null; // Define specific type if available
    timeline: { title: string; date: string }[];
}

export const PacienteService = {
    getDashboard: async (): Promise<DashboardData> => {
        const response = await api.get('/paciente/dashboard');
        return response.data;
    },

    getMisCitas: async () => {
        const response = await api.get('/paciente/mis-citas');
        return response.data;
    },

    solicitarCita: async (data: any) => {
        const response = await api.post('/paciente/solicitar-cita', data);
        return response.data;
    },

    getMisChequeos: async () => {
        const response = await api.get('/paciente/mis-chequeos');
        return response.data;
    },

    getMisExamenes: async () => {
        const response = await api.get('/paciente/mis-examenes');
        return response.data;
    },

    getMisVacunas: async () => {
        const response = await api.get('/paciente/mis-vacunas');
        return response.data;
    },

    crearChequeo: async (data: any) => {
        const response = await api.post('/paciente/chequeo', data);
        return response.data;
    }
};
