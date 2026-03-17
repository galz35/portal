import api from '@/lib/api';

export const CasosService = {
    getCasosClinicos: async (filters: { pais?: string; estado?: string }) => {
        const params = new URLSearchParams();
        if (filters.estado) params.append('estado', filters.estado);

        const response = await api.get(`/medico/casos?${params.toString()}`);
        return response.data;
    },

    getCasoById: async (id: string) => {
        const response = await api.get(`/medico/casos/${id}`);
        return response.data;
    },

    updateCaso: async (id: string, data: any) => {
        const response = await api.patch(`/medico/casos/${id}`, data);
        return response.data;
    },

    crearCasoClinico: async (data: any) => {
        const response = await api.post('/medico/casos', data);
        return response.data;
    }
};
