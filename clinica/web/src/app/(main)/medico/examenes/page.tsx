"use client";

import React, { useEffect, useState } from 'react';
import { useUserProfile } from '@/hooks/use-user-profile';
import { MedicoService } from '@/lib/services/medico.service';
import type { ExamenMedico, Paciente } from '@/lib/types/domain';
import * as XLSX from 'xlsx';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Eye, FilePenLine, UploadCloud, FlaskConical, Beaker, FileSpreadsheet, Sparkles, Filter, Search, Loader2, CheckCircle2, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

type ExamenConPaciente = ExamenMedico & { paciente: Paciente };

export default function ExamenesMedicosPage() {
  const { pais, loading: profileLoading } = useUserProfile();
  const { toast } = useToast();
  const [examenes, setExamenes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExamen, setSelectedExamen] = useState<any | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  useEffect(() => {
    if (pais) {
      setLoading(true);
      MedicoService.getExamenes({ pais })
        .then(data => {
          setExamenes(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error loading exams", err);
          setLoading(false);
        });
    }
  }, [pais]);

  const handleRegisterResult = async (idExamen: number, resultado: string) => {
    try {
      await MedicoService.updateExamen(idExamen, { resultadoResumen: resultado, estadoExamen: 'ENTREGADO' });
      const data = await MedicoService.getExamenes({ pais });
      setExamenes(data);
      toast({ title: 'Diagnóstico Registrado', description: 'El informe de laboratorio ha sido anexado al expediente.' });
      setIsRegisterModalOpen(false);
      setSelectedExamen(null);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error de Escritura', description: 'No se pudo oficializar el resultado.' });
    }
  };

  const handleBulkUpload = async (file: File) => {
    if (!file) return;
    toast({ title: 'Sincronización en curso', description: `Analizando estructura de ${file.name}` });
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataArray = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(dataArray, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet);

        let successCount = 0;
        for (const row of json) {
          const id = row.ID_EXAMEN || row.id_examen;
          const result = row.RESULTADO || row.resultado || row.resultado_resumen;

          if (id && result) {
            try {
              await MedicoService.updateExamen(id, { resultadoResumen: result, estadoExamen: 'ENTREGADO' });
              successCount++;
            } catch (e) { console.error(e); }
          }
        }

        toast({ title: 'Conciliación Finalizada', description: `Se integraron ${successCount} reportes clínicos.` });
        const updatedData = await MedicoService.getExamenes({ pais });
        setExamenes(updatedData);
        setIsBulkModalOpen(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Fallo Crítico', description: 'El archivo Excel no cumple con el protocolo de carga.' });
    }
  }

  const columns: any[] = [
    { 
        accessor: (row: any) => row.fecha_solicitud || row.fechaSolicitud, 
        header: 'Solicitud',
        cell: (row: any) => <span className="font-bold text-slate-500 italic uppercase text-[11px]">{new Date(row.fecha_solicitud || row.fechaSolicitud).toLocaleDateString()}</span>
    },
    { 
        accessor: (row: any) => row.paciente_nombre || row.pacienteNombre, 
        header: 'Paciente',
        cell: (row: any) => (
            <div className="flex flex-col">
                <span className="font-extrabold text-[#0F172A] leading-tight">{row.paciente_nombre || row.pacienteNombre}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">ID: {row.carnet_paciente || '---'}</span>
            </div>
        )
    },
    { 
        accessor: (row: any) => row.tipo_examen || row.tipoExamen, 
        header: 'Análisis / Panel',
        cell: (row: any) => (
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center">
                    <Beaker size={14} />
                </div>
                <span className="font-black text-[#0F172A] text-sm tracking-tight">{row.tipo_examen || row.tipoExamen}</span>
            </div>
        )
    },
    { 
        accessor: (row: any) => row.laboratorio, 
        header: 'Centro Analítico',
        cell: (row: any) => <span className="font-bold text-slate-400 text-[11px] uppercase tracking-widest">{row.laboratorio || 'PENDIENTE'}</span>
    },
    {
      accessor: (row: any) => row.estado_examen || row.estadoExamen,
      header: 'Estatus',
      cell: (row: any) => {
        const isDone = (row.estado_examen || row.estadoExamen) === 'ENTREGADO';
        return (
            <Badge className={cn("px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-[0.2em] border-none shadow-sm transition-all", isDone ? "bg-emerald-500 text-white" : "bg-amber-100 text-amber-600 animate-pulse")}>
                {isDone ? 'Certificado' : 'Procesando'}
            </Badge>
        )
      },
    },
    {
      accessor: (row: any) => 'actions',
      header: 'Gestión',
      cell: (row: any) => (
        <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 rounded-xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
            onClick={() => { setSelectedExamen(row); setIsRegisterModalOpen(true); }}
        >
          {(row.estado_examen || row.estadoExamen) === 'PENDIENTE' ? <FilePenLine className="h-4 w-4 text-[#DA291C]" /> : <Eye className="h-4 w-4 text-slate-400" />}
        </Button>
      ),
    },
  ];

  if (loading || profileLoading) return (
    <div className="space-y-10 animate-pulse py-10">
        <div className="h-12 w-80 bg-slate-200 rounded-2xl" />
        <div className="h-[600px] bg-slate-100 rounded-[40px]" />
    </div>
  );

  return (
    <div className="space-y-10 pb-10">
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-6 text-left">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-[#DA291C]/10 text-[#DA291C] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Laboratorio Clínico</span>
            <div className="flex items-center gap-1 text-indigo-500 font-bold text-[11px]">
               <FlaskConical size={14} /> Gestión de Resultados Digitales
            </div>
          </div>
          <h1 className="text-4xl font-black text-[#0F172A] tracking-tighter leading-none">Control de Exámenes</h1>
          <p className="text-slate-500 font-medium mt-3 text-lg">Administración, validación y carga masiva de reportes diagnósticos para la población atendida en {pais}.</p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-4">
            <Dialog open={isBulkModalOpen} onOpenChange={setIsBulkModalOpen}>
                <DialogTrigger asChild>
                    <Button className="h-14 px-8 bg-[#0F172A] hover:bg-slate-800 text-white font-black rounded-2xl shadow-xl shadow-slate-200 transition-all active:scale-95 group">
                        <UploadCloud size={20} className="mr-3 group-hover:animate-bounce" /> Sincronizar Excel
                    </Button>
                </DialogTrigger>
                <DialogContent className="rounded-[40px] border-none shadow-2xl p-0 overflow-hidden max-w-xl">
                    <div className="bg-[#0F172A] p-10 text-white">
                        <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                            <FileSpreadsheet className="text-[#DA291C]" size={28} /> Integración Masiva
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 font-medium mt-2">Protocolo de carga de resultados industriales para sistemas ERP.</DialogDescription>
                    </div>
                    <form className="p-10 space-y-6 bg-white" onSubmit={(e) => {
                        e.preventDefault();
                        const fileInput = (e.currentTarget.elements.namedItem('excel-file') as HTMLInputElement);
                        if (fileInput.files?.[0]) handleBulkUpload(fileInput.files[0]);
                    }}>
                        <div className="flex items-center justify-center w-full">
                            <label htmlFor="excel-file" className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-slate-200 rounded-3xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform mb-4">
                                        <UploadCloud className="w-8 h-8 text-[#DA291C]" />
                                    </div>
                                    <p className="mb-2 text-sm text-slate-500"><span className="font-extrabold text-[#0F172A]">Click para explorar</span> o arrastre el archivo</p>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Formato: .XLSX / .CSV</p>
                                </div>
                                <Input id="excel-file" name="excel-file" type="file" className="hidden" accept=".xlsx, .csv" />
                            </label>
                        </div>
                        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <Search size={14} /> Estructura requerida: ID_EXAMEN, RESULTADO
                            </div>
                            <Button variant="link" className="text-[#DA291C] font-black text-[10px] uppercase p-0 h-auto">Bajar Plantilla</Button>
                        </div>
                        <DialogFooter className="pt-4 border-t border-slate-100">
                            <DialogClose asChild><Button type="button" variant="ghost" className="font-bold rounded-xl h-12">Cancelar</Button></DialogClose>
                            <Button type="submit" className="bg-[#DA291C] hover:bg-[#b52217] font-black rounded-xl px-8 h-12">Iniciar Proceso</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
      </header>

      <Card className="border-none shadow-2xl shadow-indigo-100/30 rounded-[40px] overflow-hidden bg-white">
        <CardHeader className="p-10 pb-4 flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-black text-[#0F172A] tracking-tight flex items-center gap-3">
                <History className="text-[#DA291C]" size={24} /> Bitácora Analítica
            </CardTitle>
            <CardDescription className="font-medium text-slate-500">Historial completo de solicitudes y estados de laboratorio.</CardDescription>
          </div>
          <div className="bg-slate-50 p-2 rounded-2xl flex items-center gap-2 border border-slate-100">
             <Filter size={18} className="text-slate-400 ml-2" />
             <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest pr-4">Filtrado Profesional</span>
          </div>
        </CardHeader>
        <CardContent className="p-10 pt-6">
          <DataTable columns={columns} data={examenes} filterColumn="tipo_examen" filterPlaceholder="Filtrar por tipo de examen o paciente..." />
        </CardContent>
      </Card>

      <AnimatePresence>
        {selectedExamen && (
            <Dialog open={isRegisterModalOpen} onOpenChange={(open) => { if (!open) setSelectedExamen(null); setIsRegisterModalOpen(open); }}>
              <DialogContent className="rounded-[40px] border-none shadow-2xl p-0 overflow-hidden max-w-2xl bg-white">
                <div className="bg-[#DA291C] px-10 py-8 text-white">
                   <DialogTitle className="text-2xl font-black">
                    {(selectedExamen.estado_examen || selectedExamen.estadoExamen) === 'PENDIENTE' ? 'Oficializar Resultado' : 'Expediente de Laboratorio'}
                   </DialogTitle>
                </div>
                <form className="p-10 space-y-8" onSubmit={(e) => {
                  e.preventDefault();
                  if ((selectedExamen.estado_examen || selectedExamen.estadoExamen) === 'PENDIENTE') {
                    const formData = new FormData(e.currentTarget);
                    const resultado = formData.get('resultado') as string;
                    handleRegisterResult(selectedExamen.id_examen || selectedExamen.idExamen, resultado);
                  } else { setIsRegisterModalOpen(false); }
                }}>
                  <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-200/50">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paciente</p>
                        <p className="font-black text-[#0F172A]">{selectedExamen.paciente_nombre || selectedExamen.pacienteNombre}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Análisis</p>
                        <p className="font-black text-[#0F172A]">{selectedExamen.tipo_examen || selectedExamen.tipoExamen}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-500" /> Resumen del Hallazgo Clínico
                    </label>
                    <Textarea
                      name="resultado"
                      className="min-h-[200px] rounded-3xl border-slate-100 bg-slate-50 font-medium p-8 resize-none focus:ring-[#DA291C]"
                      placeholder="Redacte las conclusiones del análisis aquí..."
                      defaultValue={selectedExamen.resultado_resumen || selectedExamen.resultadoResumen}
                      readOnly={(selectedExamen.estado_examen || selectedExamen.estadoExamen) === 'ENTREGADO'}
                      required
                    />
                  </div>

                  <DialogFooter className="flex flex-row justify-end items-center gap-4 border-t border-slate-100 pt-8">
                    <DialogClose asChild><Button type="button" variant="ghost" className="font-bold rounded-xl h-12">Cerrar</Button></DialogClose>
                    {(selectedExamen.estado_examen || selectedExamen.estadoExamen) === 'PENDIENTE' && (
                      <Button type="submit" className="bg-[#DA291C] hover:bg-[#b52217] font-black rounded-xl px-10 h-12 shadow-lg shadow-red-200">
                        <Sparkles size={16} className="mr-2" /> Guardar Informe
                      </Button>
                    )}
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
