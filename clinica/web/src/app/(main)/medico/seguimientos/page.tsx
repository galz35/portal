"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { MedicoService } from '@/lib/services/medico.service';
import type { SeguimientoPaciente, Paciente, CasoClinico } from '@/lib/types/domain';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SemaforoBadge } from '@/components/shared/SemaforoBadge';
import { Check, Eye, MoreHorizontal, MessageSquarePlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type SeguimientoConDetalle = SeguimientoPaciente & { paciente: Paciente, caso: CasoClinico };

export default function SeguimientosPage() {
  const { pais } = useAuth();
  const { toast } = useToast();
  const [seguimientos, setSeguimientos] = useState<SeguimientoConDetalle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeguimiento, setSelectedSeguimiento] = useState<SeguimientoConDetalle | null>(null);
  const [isNoteModalOpen, setNoteModalOpen] = useState(false);

  useEffect(() => {
    if (pais) {
      MedicoService.getSeguimientos({ pais })
        .then(data => {
          setSeguimientos(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error loading follow-ups", err);
          setLoading(false);
        });
    }
  }, [pais]);

  const handleUpdateSeguimiento = async (formData: { notas: string, estado: SeguimientoPaciente['estadoSeguimiento'] }) => {
    if (!selectedSeguimiento) return;

    try {
      // Assuming we have an update endpoint
      await MedicoService.updateSeguimiento(selectedSeguimiento.idSeguimiento, {
        estadoSeguimiento: formData.estado,
        notasSeguimiento: `${selectedSeguimiento.notasSeguimiento || ''}\n[${new Date().toLocaleString('es-ES')}] - ${formData.notas}`,
        fechaReal: formData.estado === 'RESUELTO' ? new Date().toISOString().split('T')[0] : undefined
      });

      // Optimistic update or refetch
      setSeguimientos(prev => prev.map(s => s.idSeguimiento === selectedSeguimiento.idSeguimiento ? {
        ...s,
        estadoSeguimiento: formData.estado,
        notasSeguimiento: `${s.notasSeguimiento || ''}\n[${new Date().toLocaleString('es-ES')}] - ${formData.notas}`,
        ...(formData.estado === 'RESUELTO' && { fechaReal: new Date().toISOString().split('T')[0] })
      } : s));

      toast({ title: 'Seguimiento actualizado', description: 'La nota y el estado se han guardado.' });
      setNoteModalOpen(false);
      setSelectedSeguimiento(null);
    } catch (error) {
      console.error("Error updating follow-up", error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo actualizar el seguimiento.' });
    }
  };

  const getStatusClass = (status: SeguimientoPaciente['estadoSeguimiento']) => {
    switch (status) {
      case 'PENDIENTE': return 'bg-yellow-100 text-yellow-800';
      case 'EN_PROCESO': return 'bg-blue-100 text-blue-800';
      case 'RESUELTO': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  const columns = [
    { accessor: 'fechaProgramada', header: 'F. Programada' },
    { accessor: (row: SeguimientoConDetalle) => row.paciente.nombreCompleto, header: 'Paciente' },
    {
      accessor: 'nivelSemaforo',
      header: 'Semáforo',
      cell: (row: SeguimientoConDetalle) => <SemaforoBadge nivel={row.caso.nivelSemaforo} />
    },
    { accessor: 'tipoSeguimiento', header: 'Tipo' },
    {
      accessor: 'estadoSeguimiento',
      header: 'Estado',
      cell: (row: SeguimientoConDetalle) => <Badge className={cn("border-transparent", getStatusClass(row.estadoSeguimiento))}>{row.estadoSeguimiento.replace('_', ' ')}</Badge>
    },
    {
      accessor: 'actions',
      header: 'Acciones',
      cell: (row: SeguimientoConDetalle) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setSelectedSeguimiento(row); setNoteModalOpen(true); }}>
              <MessageSquarePlus className="mr-2 h-4 w-4" /> Registrar Nota
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/medico/casos/${row.idCaso}`}>
                <Eye className="mr-2 h-4 w-4" /> Ver Caso Asociado
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (loading) return <div>Cargando seguimientos...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Seguimiento de Pacientes</h1>
      <Card>
        <CardHeader><CardTitle>Listado de Seguimientos</CardTitle></CardHeader>
        <CardContent>
          <DataTable columns={columns} data={seguimientos} filterColumn="estadoSeguimiento" filterPlaceholder="Filtrar por estado..." />
        </CardContent>
      </Card>

      <Dialog open={isNoteModalOpen} onOpenChange={(open) => { if (!open) setSelectedSeguimiento(null); setNoteModalOpen(open); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Nota de Seguimiento</DialogTitle>
            <DialogDescription>Paciente: {selectedSeguimiento?.paciente.nombreCompleto}</DialogDescription>
          </DialogHeader>
          <form id="note-form" onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const data = {
              notas: formData.get('notas-seguimiento') as string,
              estado: formData.get('estado-seguimiento') as SeguimientoPaciente['estadoSeguimiento']
            };
            handleUpdateSeguimiento(data);
          }}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="notas-seguimiento">Nota</Label>
                <Textarea id="notas-seguimiento" name="notas-seguimiento" placeholder="Ej: Contactado por llamada, reporta mejoría. Se indica continuar tratamiento..." required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado-seguimiento">Actualizar Estado</Label>
                <Select name="estado-seguimiento" defaultValue={selectedSeguimiento?.estadoSeguimiento}>
                  <SelectTrigger id="estado-seguimiento"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                    <SelectItem value="EN_PROCESO">En Proceso</SelectItem>
                    <SelectItem value="RESUELTO">Resuelto</SelectItem>
                    <SelectItem value="CANCELADO">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Card className='bg-muted/50 max-h-32 overflow-y-auto'>
                <CardHeader className='p-2 pb-0'><CardTitle className='text-sm'>Historial de Notas</CardTitle></CardHeader>
                <CardContent className='p-2 text-xs'>
                  <pre className='whitespace-pre-wrap font-sans'>{selectedSeguimiento?.notasSeguimiento}</pre>
                </CardContent>
              </Card>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="ghost">Cancelar</Button></DialogClose>
              <Button type="submit">Guardar Nota</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
