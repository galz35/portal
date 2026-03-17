"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MedicoService, AtencionPageData } from '@/lib/services/medico.service';
import { AtencionCitaWizard } from '@/components/medico/AtencionCitaWizard';
import { Skeleton } from '@/components/ui/skeleton';

export default function AtencionCitaPage() {
  const params = useParams();
  const idCita = params.idCita as string;
  const [data, setData] = useState<AtencionPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!idCita) {
      setError("ID de cita no válido.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const atencionData = await MedicoService.getAtencionMedicaData(idCita);
        if (!atencionData) {
          throw new Error("No se encontraron los datos para la atención");
        }
        setData(atencionData);
      } catch (err: any) {
        setError(err.message || "Ocurrió un error al cargar los datos.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idCita]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="text-destructive text-center p-8">{error}</div>;
  }

  if (!data) {
    return <div className="text-center p-8">No se encontraron datos para esta cita.</div>;
  }

  return (
    <div>
      <AtencionCitaWizard citaData={data} />
    </div>
  );
}
