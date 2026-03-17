"use client";

import React from 'react';
import type { DatosExtraJSON } from '@/lib/types/solicitud';
import { Chip, ChipGroup } from '../Chip';
import { Textarea } from '@/components/ui/textarea';

interface Step4Props {
    datosExtra: DatosExtraJSON;
    updateDatosExtra: (field: keyof DatosExtraJSON, value: any) => void;
    comentario: string;
    setComentario: (comment: string) => void;
}

const insumosOptions = ["Mascarilla", "Alcohol gel", "Toallas", "Botiquín", "Ninguno"];

export function Step4_Revision({ datosExtra, updateDatosExtra, comentario, setComentario }: Step4Props) {

    const handleInsumoChange = (value: string) => {
        const current = new Set(datosExtra.Insumos);
        if (value === 'Ninguno') {
            // If "Ninguno" is selected, clear others and add it. If it's being deselected, just clear it.
            if (current.has('Ninguno')) {
                current.delete('Ninguno');
            } else {
                current.clear();
                current.add('Ninguno');
            }
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
            {datosExtra.Ruta === 'consulta' && (
                 <div>
                    <h3 className="text-lg font-semibold mb-2">¿Tu área cuenta con estos insumos de bienestar?</h3>
                    <ChipGroup>
                        {insumosOptions.map(insumo => (
                            <Chip key={insumo} multi active={datosExtra.Insumos.includes(insumo)} onClick={() => handleInsumoChange(insumo)}>
                                {insumo}
                            </Chip>
                        ))}
                    </ChipGroup>
                 </div>
            )}
             
            <div>
                <h3 className="text-lg font-semibold mb-2">Nota (opcional)</h3>
                <Textarea 
                    placeholder="Si quieres añadir algo más, escríbelo aquí..." 
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    rows={4}
                />
            </div>
            
            <div className='p-4 bg-muted rounded-lg space-y-3'>
                <h3 className='font-bold text-center'>Resumen de tu solicitud</h3>
                <div className='text-sm space-y-1'>
                    <p><strong>Motivo:</strong> <span className='capitalize'>{datosExtra.Ruta}</span></p>
                    <p><strong>Modalidad de trabajo:</strong> {datosExtra.Modalidad || 'No especificado'}</p>
                    <p><strong>Síntomas reportados:</strong> {datosExtra.Sintomas.length > 0 ? datosExtra.Sintomas.join(', ') : 'Ninguno'}</p>
                    <p><strong>Alergias activas:</strong> {datosExtra.Alergia.activa ? `Sí (${datosExtra.Alergia.descripcion || 'sin descripción'})` : 'No'}</p>
                </div>
            </div>
        </div>
    );
}
