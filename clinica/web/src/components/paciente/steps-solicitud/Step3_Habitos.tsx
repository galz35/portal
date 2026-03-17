"use client";

import React from 'react';
import type { DatosExtraJSON } from '@/lib/types/solicitud';
import { Chip, ChipGroup } from '../Chip';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from '@/components/ui/label';

interface Step3Props {
    datosExtra: DatosExtraJSON;
    updateDatosExtra: (field: keyof DatosExtraJSON, value: any) => void;
    aptoLaboral: boolean | null;
    setAptoLaboral: (value: boolean) => void;
    motivoNoApto: string;
    setMotivoNoApto: (value: string) => void;
}

export function Step3_Habitos({ datosExtra, updateDatosExtra, aptoLaboral, setAptoLaboral, motivoNoApto, setMotivoNoApto }: Step3Props) {
    
    const handleAlergiaChange = (value: boolean) => {
        updateDatosExtra('Alergia', { ...datosExtra.Alergia, activa: value });
    }
    const handleAlergiaDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        updateDatosExtra('Alergia', { ...datosExtra.Alergia, descripcion: e.target.value });
    }
    const handleHabitoChange = (field: 'sueno' | 'hidratacion', value: any) => {
        updateDatosExtra('Habitos', { ...datosExtra.Habitos, [field]: value });
    }
    const handlePsicosocialChange = (field: 'estres' | 'animo', value: any) => {
        updateDatosExtra('Psicosocial', { ...datosExtra.Psicosocial, [field]: value });
    }

    return (
        <div className="space-y-8">
             <div>
                <h3 className="text-lg font-semibold mb-2">¿Tienes alergia activa hoy?</h3>
                <ToggleGroup type="single" value={String(datosExtra.Alergia.activa)} onValueChange={(v) => handleAlergiaChange(v === 'true')}>
                    <ToggleGroupItem value="true" aria-label="Sí">Sí</ToggleGroupItem>
                    <ToggleGroupItem value="false" aria-label="No">No</ToggleGroupItem>
                </ToggleGroup>

                {datosExtra.Alergia.activa === true && (
                    <div className='mt-4 animate-in fade-in-50'>
                        <label className='font-medium text-sm'>¿A qué?</label>
                        <Textarea placeholder="Describe tus alergias..." className="mt-2" onChange={handleAlergiaDescChange} value={datosExtra.Alergia.descripcion || ''}/>
                    </div>
                )}
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-2">Salud y Hábitos</h3>
                <div className='space-y-6'>
                    <div>
                        <h4 className='font-medium text-sm mb-2'>¿Cómo dormiste?</h4>
                        <ChipGroup>
                            <Chip active={datosExtra.Habitos.sueno === 'Bien'} onClick={() => handleHabitoChange('sueno', 'Bien')}>Bien</Chip>
                            <Chip active={datosExtra.Habitos.sueno === 'Regular'} onClick={() => handleHabitoChange('sueno', 'Regular')}>Regular</Chip>
                            <Chip active={datosExtra.Habitos.sueno === 'Mal'} onClick={() => handleHabitoChange('sueno', 'Mal')}>Mal</Chip>
                        </ChipGroup>
                    </div>
                    <div>
                        <h4 className='font-medium text-sm mb-2'>¿Ha bebido agua hoy?</h4>
                        <ChipGroup>
                            <Chip active={datosExtra.Habitos.hidratacion === 'Sí'} onClick={() => handleHabitoChange('hidratacion', 'Sí')}>Sí</Chip>
                            <Chip active={datosExtra.Habitos.hidratacion === 'Poco'} onClick={() => handleHabitoChange('hidratacion', 'Poco')}>Poco</Chip>
                            <Chip active={datosExtra.Habitos.hidratacion === 'Aún no'} onClick={() => handleHabitoChange('hidratacion', 'Aún no')}>Aún no</Chip>
                        </ChipGroup>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-2">Bienestar Emocional</h3>
                <div className='space-y-6'>
                     <div>
                        <h4 className='font-medium text-sm mb-2'>Nivel de estrés hoy</h4>
                        <ChipGroup>
                            <Chip active={datosExtra.Psicosocial.estres === 'Bajo'} onClick={() => handlePsicosocialChange('estres', 'Bajo')}>Bajo</Chip>
                            <Chip active={datosExtra.Psicosocial.estres === 'Medio'} onClick={() => handlePsicosocialChange('estres', 'Medio')}>Medio</Chip>
                            <Chip active={datosExtra.Psicosocial.estres === 'Alto'} onClick={() => handlePsicosocialChange('estres', 'Alto')}>Alto</Chip>
                        </ChipGroup>
                    </div>
                    <div>
                        <h4 className='font-medium text-sm mb-2'>Estado de ánimo general</h4>
                         <ChipGroup>
                            <Chip active={datosExtra.Psicosocial.animo === 'Bien'} onClick={() => handlePsicosocialChange('animo', 'Bien')}>Bien</Chip>
                            <Chip active={datosExtra.Psicosocial.animo === 'Regular'} onClick={() => handlePsicosocialChange('animo', 'Regular')}>Regular</Chip>
                            <Chip active={datosExtra.Psicosocial.animo === 'Decaído'} onClick={() => handlePsicosocialChange('animo', 'Decaído')}>Decaído</Chip>
                        </ChipGroup>
                    </div>
                </div>
            </div>

             <div>
                <h3 className="text-lg font-semibold mb-2">¿Estás en condiciones de trabajar?</h3>
                <ToggleGroup type="single" value={String(aptoLaboral)} onValueChange={(v) => setAptoLaboral(v === 'true')}>
                    <ToggleGroupItem value="true" aria-label="Sí">Sí</ToggleGroupItem>
                    <ToggleGroupItem value="false" aria-label="No">No</ToggleGroupItem>
                </ToggleGroup>

                {aptoLaboral === false && (
                    <div className="mt-4 space-y-2 animate-in fade-in-50">
                        <Label htmlFor="motivo-no-apto">Por favor, describe brevemente por qué no te sientes apto para laborar:</Label>
                        <Textarea 
                            id="motivo-no-apto"
                            value={motivoNoApto}
                            onChange={(e) => setMotivoNoApto(e.target.value)}
                            placeholder="Ej: El dolor de cabeza es muy intenso, tengo mareos, etc."
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
