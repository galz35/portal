"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { StepHeaderWizard } from './StepHeaderWizard';
import { Button } from '@/components/ui/button';
import { AtencionMedica, CitaMedica, Paciente, EmpleadoEmp2024, EstadoClinico, VacunaAplicada, RegistroPsicosocial, SeguimientoGenerado, CasoClinico } from '@/lib/types/domain';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MedicoService } from '@/lib/services/medico.service';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useToast } from '@/hooks/use-toast';

// Import steps
import { Step1_Resumen } from './steps/Step1_Resumen';
import { Step2_Vitales } from './steps/Step2_Vitales';
import { Step3_Diagnostico } from './steps/Step3_Diagnostico';
import { Step4_Seguimiento } from './steps/Step4_Seguimiento';
import { Step5_Cierre } from './steps/Step5_Cierre';


const TOTAL_STEPS = 5;

interface AtencionCitaWizardProps {
    citaData: {
        cita: CitaMedica;
        paciente: Paciente;
        empleado: EmpleadoEmp2024;
        caso: CasoClinico;
    };
}

export function AtencionCitaWizard({ citaData }: AtencionCitaWizardProps) {
    const { userProfile } = useUserProfile();
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Main state for the medical attention
    const [atencion, setAtencion] = useState<AtencionMedica>({
        idAtencion: Date.now(),
        idCita: citaData.cita.id!,
        idCaso: citaData.cita.idCaso,
        idMedico: userProfile!.idMedico!,
        fechaAtencion: new Date().toISOString(),
        estadoClinico: 'BIEN',
        diagnosticoPrincipal: '',
        requiereSeguimiento: false,
    });

    const [vacunas, setVacunas] = useState<VacunaAplicada[]>([]);
    const [psico, setPsico] = useState<RegistroPsicosocial>({
        idRegistroPsico: Date.now(),
        idAtencion: atencion.idAtencion.toString(),
        idPaciente: citaData.paciente.id,
        idMedico: userProfile?.idMedico,
        fechaRegistro: new Date().toISOString(),
        confidencial: true,
        sintomasPsico: [],
    });
    const [seguimientos, setSeguimientos] = useState<SeguimientoGenerado[]>([]);

    const handleNext = () => setStep(prev => Math.min(prev + 1, TOTAL_STEPS));
    const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));

    const handleChangeAtencion = (field: keyof AtencionMedica, value: any) => {
        setAtencion(prev => ({ ...prev, [field]: value }));
    };

    const handleUpdatePsico = (field: keyof RegistroPsicosocial, value: any) => {
        setPsico(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        const payload = {
            idCita: atencion.idCita,
            idMedico: atencion.idMedico,
            diagnosticoPrincipal: atencion.diagnosticoPrincipal,
            planTratamiento: atencion.planTratamiento,
            recomendaciones: atencion.recomendaciones,
            requiereSeguimiento: atencion.requiereSeguimiento,
            fechaSiguienteCita: atencion.fechaSiguienteCita,
            // Add other fields as needed by CrearAtencionDto
        };
        try {
            await MedicoService.crearAtencion(payload);
            setShowSummaryModal(true);
        } catch (error: any) {
            console.error("Error guardando la atención", error);
            toast({
                title: 'Error al Guardar',
                description: error.message || 'No se pudo registrar la atención.',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };


    const stepConfig = useMemo(() => [
        { title: `Atención para: ${citaData.paciente.nombreCompleto}`, theme: 'primary', guide: 'Confirma los detalles de la cita y el contexto del paciente antes de continuar.' },
        { title: 'Signos Vitales y Estado Clínico', theme: 'slate', guide: 'Registra los signos vitales básicos y define el estado clínico general del paciente en esta consulta.' },
        { title: 'Diagnóstico y Plan', theme: 'green', guide: 'Establece el diagnóstico principal y detalla el plan de tratamiento y las recomendaciones.' },
        { title: 'Seguimiento', theme: 'gray', guide: 'Determina si el paciente necesita una cita de seguimiento y genera el recordatorio correspondiente.' },
        { title: 'Acciones Adicionales y Cierre', theme: 'dark', guide: 'Registra acciones de la empresa, notas psicosociales y revisa el resumen antes de guardar.' },
    ], [citaData.paciente.nombreCompleto]);

    const currentStepConfig = stepConfig[step - 1];

    return (
        <Card className='overflow-hidden'>
            <StepHeaderWizard
                step={step}
                totalSteps={TOTAL_STEPS}
                title={currentStepConfig.title}
                theme={currentStepConfig.theme as any}
                guide={currentStepConfig.guide}
            />
            <CardContent className="p-6">
                {step === 1 && <Step1_Resumen citaData={citaData} />}
                {step === 2 && <Step2_Vitales atencion={atencion} handleChange={handleChangeAtencion} />}
                {step === 3 && <Step3_Diagnostico atencion={atencion} handleChange={handleChangeAtencion} />}
                {step === 4 && <Step4_Seguimiento atencion={atencion} handleChange={handleChangeAtencion} setSeguimientos={setSeguimientos} idPaciente={citaData.paciente.id!} />}
                {step === 5 && <Step5_Cierre atencion={atencion} vacunas={vacunas} setVacunas={setVacunas} psico={psico} setPsico={handleUpdatePsico} idPaciente={citaData.paciente.id!} />}

                <div className="mt-8 flex justify-between">
                    <Button variant="outline" onClick={handlePrev} disabled={step === 1 || isSaving}>
                        ← Anterior
                    </Button>
                    {step < TOTAL_STEPS ? (
                        <Button onClick={handleNext} disabled={isSaving}>
                            Siguiente →
                        </Button>
                    ) : (
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? 'Guardando...' : 'Guardar Atención'}
                        </Button>
                    )}
                </div>
            </CardContent>

            <AlertDialog open={showSummaryModal}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Atención Guardada Exitosamente</AlertDialogTitle>
                        <AlertDialogDescription>
                            La atención para <strong>{citaData.paciente.nombreCompleto}</strong> ha sido registrada.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="text-sm space-y-2 max-h-60 overflow-y-auto">
                        <p><strong>Diagnóstico:</strong> {atencion.diagnosticoPrincipal}</p>
                        {atencion.requiereSeguimiento && <p><strong>Seguimiento Programado:</strong> Sí, para el {atencion.fechaSiguienteCita}</p>}
                        {vacunas.length > 0 && <p><strong>Vacunas Aplicadas:</strong> {vacunas.length}</p>}
                        {seguimientos.length > 0 && <p><strong>Nuevos Seguimientos:</strong> {seguimientos.length}</p>}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => window.location.href = '/medico/agenda-citas'}>Cerrar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}
