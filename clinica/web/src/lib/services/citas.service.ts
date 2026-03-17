import api from '@/lib/api';

export const CitasService = {
    agendarCita: async (data: any) => {
        const response = await api.post('/medico/agenda-citas/agendar', data);
        return response.data;
    },

    getCitaById: async (id: string) => {
        const response = await api.get(`/medico/citas/${id}`);
        return response.data;
    }
};
