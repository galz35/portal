"use client";
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

import type { RutaMotivo, TriageNivel, ModalidadTrabajo, DatosExtraJSON, SolicitudCitaPayload } from '@/lib/types/solicitud';
import { PacienteService } from '@/lib/services/paciente.service';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useToast } from '@/hooks/use-toast';

// Sub-components for steps
import { Step1_EstadoHoy } from './steps-solicitud/Step1_EstadoHoy';
import { Step2_Sintomas } from './steps-solicitud/Step2_Sintomas';
import { Step3_Habitos } from './steps-solicitud/Step3_Habitos';
import { Step4_Revision } from './steps-solicitud/Step4_Revision';

const TOTAL_STEPS = 4;

const stepNames = [
    'Tu estado hoy',
    '¿Qué te molesta?',
    'Hábitos y bienestar',
    'Revisión y envío'
];

const stepHelps = [
    'Cuéntanos cómo te sientes hoy. Si todo está bien, puedes finalizar rápido.',
    'Elige la zona y luego los síntomas. Puedes quitar tocando de nuevo.',
    'Cuéntanos sobre tus hábitos y estado de ánimo para darnos más contexto.',
    'Revisa tus datos, agrega una nota si deseas y envía tu registro.'
];

const themeClasses = {
    primary: "from-primary to-red-700",
    slate: "from-slate-600 to-slate-800",
    green: "from-green-600 to-teal-800",
    dark: "from-gray-800 to-black",
};

const initialDatosExtra: DatosExtraJSON = {
    Ruta: null,
    Modalidad: null,
    Categorias: [],
    Sintomas: [],
    SintomasKeys: [], // keys internos de cada síntoma
    Detalles: {},
    Alergia: { activa: null },
    Habitos: { sueno: null, hidratacion: null },
    Psicosocial: { estres: null, animo: null },
    Insumos: [],
};

export function SolicitudCitaWizard() {
    const { userProfile, pais } = useUserProfile();
    const { toast } = useToast();

    const [step, setStep] = useState(1);
    const [ruta, setRuta] = useState<RutaMotivo | null>(null);
    const [modalidad, setModalidad] = useState<ModalidadTrabajo | null>(null);
    const [aptoLaboral, setAptoLaboral] = useState<boolean | null>(true);
    const [motivoNoApto, setMotivoNoApto] = useState('');
    const [triage, setTriage] = useState<TriageNivel>('VERDE');
    const [comentario, setComentario] = useState('');
    const [datosExtra, setDatosExtra] = useState<DatosExtraJSON>(initialDatosExtra);

    const [isLoading, setIsLoading] = useState(false);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [finalPayload, setFinalPayload] = useState<SolicitudCitaPayload | null>(null);

    const updateDatosExtra = (field: keyof DatosExtraJSON, value: any) => {
        setDatosExtra(prev => ({ ...prev, [field]: value }));
    };

    const resetWizard = () => {
        setStep(1);
        setRuta(null);
        setModalidad(null);
        setAptoLaboral(true);
        setMotivoNoApto('');
        setTriage('VERDE');
        setComentario('');
        setDatosExtra(initialDatosExtra);
        setShowSummaryModal(false);
        setFinalPayload(null);
    }

    const calcTriage = useCallback((): TriageNivel => {
        const detalles = Object.values(datosExtra.Detalles);
        const urgentes = datosExtra.SintomasKeys.filter(key => ['dolorPecho', 'dificultadRespirar', 'desmayo', 'sangradoInusual'].includes(key));

        if (urgentes.length > 0) return 'ROJO';

        const intensos = detalles.filter(d => (d.Intensidad || 0) >= 7);
        if (intensos.length >= 2 || datosExtra.Psicosocial.estres === 'Alto' || datosExtra.Habitos.sueno === 'Mal') return 'AMARILLO';

        return 'VERDE';
    }, [datosExtra]);

    useEffect(() => {
        const newTriage = calcTriage();
        setTriage(newTriage);
        if (newTriage === 'ROJO') {
            setAptoLaboral(false);
        }
    }, [datosExtra, calcTriage]);

    const handleNext = () => {
        if (step === 1 && !ruta) {
            toast({ variant: 'destructive', title: 'Campo requerido', description: 'Por favor, selecciona cómo te sientes hoy.' })
            return;
        }
        if (step === 1 && ruta === 'bien') {
            setStep(TOTAL_STEPS);
        } else {
            setStep(prev => Math.min(prev + 1, TOTAL_STEPS));
        }
    };
    const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async () => {
        if (!userProfile?.idPaciente) {
            toast({ variant: 'destructive', title: 'Error de Usuario', description: 'No se pudo identificar al paciente.' });
            return;
        }

        setIsLoading(true);

        const payload: SolicitudCitaPayload = {
            Ruta: ruta,
            Modalidad: modalidad,
            AptoLaboral: aptoLaboral,
            MotivoNoApto: !aptoLaboral ? motivoNoApto : null,
            AlergiasActivas: datosExtra.Alergia.activa,
            AlergiasDescripcion: datosExtra.Alergia.descripcion || null,
            Triage: triage,
            Comentario: comentario || null,
            DatosExtraJSON: datosExtra,
        };

        setFinalPayload(payload);

        // The backend expects a DTO structure that matches SolicitudCitaDto
        // We need to adapt the payload to what the backend expects
        const solicitudDto = {
            ruta: payload.Ruta,
            modalidad: payload.Modalidad,
            aptoLaboral: payload.AptoLaboral,
            motivoNoApto: payload.MotivoNoApto,
            alergiasActivas: payload.AlergiasActivas,
            alergiasDescripcion: payload.AlergiasDescripcion,
            triage: payload.Triage,
            comentarioGeneral: payload.Comentario,
            datosCompletos: payload.DatosExtraJSON
        };

        try {
            await PacienteService.solicitarCita(solicitudDto);
            setShowSummaryModal(true);
        } catch (error: any) {
            console.error("Error al guardar la solicitud", error);
            toast({ variant: 'destructive', title: 'Error', description: error.message || 'Hubo un error al guardar tu solicitud. Inténtalo de nuevo.' })
        } finally {
            setIsLoading(false);
        }
    };

    const currentStepConfig = useMemo(() => {
        const themeMap = ['primary', 'slate', 'green', 'dark'];
        return {
            name: stepNames[step - 1],
            help: stepHelps[step - 1],
            theme: themeMap[step - 1],
        };
    }, [step]);

    const progress = (step / TOTAL_STEPS) * 100;
    const gradientClass = themeClasses[currentStepConfig.theme as keyof typeof themeClasses];

    return (
        <Card className='overflow-hidden shadow-lg rounded-xl'>
            <div className={cn("bg-gradient-to-r p-6 text-white", gradientClass)}>
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-bold">{currentStepConfig.name}</h2>
                    <span className="text-sm font-medium">Paso {step} de {TOTAL_STEPS}</span>
                </div>
                <p className="text-sm opacity-90 mb-4">{currentStepConfig.help}</p>
                <Progress value={progress} className="h-2 bg-white/30 [&>div]:bg-white" />
            </div>

            <CardContent className="p-4 md:p-6">
                <div className="min-h-[400px]">
                    {step === 1 && <Step1_EstadoHoy setRuta={setRuta} ruta={ruta} setModalidad={setModalidad} modalidad={modalidad} datosExtra={datosExtra} updateDatosExtra={updateDatosExtra} setComentario={setComentario} />}
                    {step === 2 && <Step2_Sintomas datosExtra={datosExtra} updateDatosExtra={updateDatosExtra} />}
                    {step === 3 && <Step3_Habitos aptoLaboral={aptoLaboral} setAptoLaboral={setAptoLaboral} datosExtra={datosExtra} updateDatosExtra={updateDatosExtra} motivoNoApto={motivoNoApto} setMotivoNoApto={setMotivoNoApto} />}
                    {step === 4 && <Step4_Revision datosExtra={datosExtra} updateDatosExtra={updateDatosExtra} comentario={comentario} setComentario={setComentario} />}
                </div>

                <div className="mt-8 flex justify-between items-center">
                    <Button variant="outline" onClick={handlePrev} disabled={step === 1 || isLoading}>
                        ← Anterior
                    </Button>
                    <div className='text-sm text-muted-foreground'>Progreso: {Math.round(progress)}%</div>
                    {step < TOTAL_STEPS ? (
                        <Button onClick={handleNext} disabled={isLoading}>
                            Siguiente →
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={isLoading}>
                            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando Chequeo...</> : 'Enviar Chequeo'}
                        </Button>
                    )}
                </div>
            </CardContent>

            <AlertDialog open={showSummaryModal}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¡Solicitud Registrada!</AlertDialogTitle>
                        <AlertDialogDescription>
                            Hemos recibido tu solicitud. Nuestro sistema de IA la pre-analizará y el equipo médico se pondrá en contacto contigo pronto.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="text-sm space-y-3 max-h-60 overflow-y-auto">
                        <p><strong>Motivo:</strong> <span className="capitalize">{finalPayload?.Ruta}</span></p>
                        <p><strong>Modalidad:</strong> {finalPayload?.Modalidad}</p>
                        <p><strong>Nivel de Urgencia (Triage):</strong> <span className={cn(finalPayload?.Triage === 'ROJO' && 'text-red-500 font-bold')}>{finalPayload?.Triage}</span></p>
                        <p><strong>Apto para laborar:</strong> {finalPayload?.AptoLaboral ? 'Sí' : 'No'}</p>
                        <div>
                            <strong>Síntomas Reportados:</strong>
                            <ul className="list-disc list-inside ml-4 text-muted-foreground">
                                {finalPayload?.DatosExtraJSON.Sintomas.map(s => <li key={s}>{s}</li>)}
                                {finalPayload?.DatosExtraJSON.Sintomas.length === 0 && <li>Ninguno</li>}
                            </ul>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={resetWizard}>Cerrar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}
