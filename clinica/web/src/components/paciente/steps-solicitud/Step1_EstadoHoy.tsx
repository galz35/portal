"use client";

import React from 'react';
import type { RutaMotivo, ModalidadTrabajo, DatosExtraJSON } from '@/lib/types/solicitud';
import { Chip, ChipGroup } from '../Chip';
import { Textarea } from '@/components/ui/textarea';

interface Step1Props {
    ruta: RutaMotivo | null;
    setRuta: (ruta: RutaMotivo) => void;
    modalidad: ModalidadTrabajo | null;
    setModalidad: (modalidad: ModalidadTrabajo) => void;
    datosExtra: DatosExtraJSON;
    updateDatosExtra: (field: keyof DatosExtraJSON, value: any) => void;
    setComentario: (comment: string) => void;
}

const insumosOptions = ["Mascarilla", "Alcohol gel", "Toallas", "Botiquín", "Ninguno"];

export function Step1_EstadoHoy({ ruta, setRuta, modalidad, setModalidad, datosExtra, updateDatosExtra, setComentario }: Step1Props) {
    
    const handleInsumoChange = (value: string) => {
        const current = new Set(datosExtra.Insumos);
        if (value === 'Ninguno') {
            current.clear();
            current.add('Ninguno');
        } else {
            current.delete('Ninguno');
            if (current.has(value)) {
                current.delete(value);
            } else {
                current.add(value);
            }
        }
        updateDatosExtra('Insumos', Array.from(current));
    };
    
    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-semibold mb-2">¿Cómo te sientes hoy?</h3>
                <ChipGroup>
                    <Chip active={ruta === 'bien'} onClick={() => { setRuta('bien'); updateDatosExtra('Ruta', 'bien'); }}>Me siento bien</Chip>
                    <Chip active={ruta === 'consulta'} onClick={() => { setRuta('consulta'); updateDatosExtra('Ruta', 'consulta'); }}>Tengo alguna molestia</Chip>
                </ChipGroup>
            </div>
            <div>
                <h3 className="text-lg font-semibold mb-2">¿Dónde trabajas hoy?</h3>
                <ChipGroup>
                    <Chip active={modalidad === 'Oficina'} onClick={() => { setModalidad('Oficina'); updateDatosExtra('Modalidad', 'Oficina'); }}>Oficina</Chip>
                    <Chip active={modalidad === 'Remoto'} onClick={() => { setModalidad('Remoto'); updateDatosExtra('Modalidad', 'Remoto'); }}>Remoto</Chip>
                    <Chip active={modalidad === 'Vacaciones'} onClick={() => { setModalidad('Vacaciones'); updateDatosExtra('Modalidad', 'Vacaciones'); }}>Vacaciones</Chip>
                </ChipGroup>
            </div>

            {ruta === 'bien' && (
                <div className="p-4 border-l-4 border-green-500 bg-green-50 rounded-r-lg space-y-6 animate-in fade-in-50">
                    <h3 className="font-semibold text-green-800">¡Qué bien! Finaliza tu chequeo rápido.</h3>
                     <div>
                        <h4 className="text-md font-semibold mb-2">¿Tu área cuenta con estos insumos de bienestar?</h4>
                        <ChipGroup>
                            {insumosOptions.map(insumo => (
                                <Chip key={insumo} multi active={datosExtra.Insumos.includes(insumo)} onClick={() => handleInsumoChange(insumo)}>
                                    {insumo}
                                </Chip>
                            ))}
                        </ChipGroup>
                     </div>
                     <div>
                         <h4 className="text-md font-semibold mb-2">Comentario (Opcional)</h4>
                         <Textarea placeholder="Si quieres añadir algo más, escríbelo aquí..." onChange={(e) => setComentario(e.target.value)} />
                     </div>
                </div>
            )}
        </div>
    );
}
