"use client";

import React, { useState } from 'react';
import type { DatosExtraJSON, DetalleSintoma } from '@/lib/types/solicitud';
import { Chip, ChipGroup } from '../Chip';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const catalogoSintomas = {
    "General": [
        { key: "fiebreSensacion", label: "Siento el cuerpo caliente (temperatura)" },
        { key: "escalofrios", label: "Escalofríos" },
        { key: "malestarGeneral", label: "Malestar general" },
        { key: "fatiga", label: "Cansancio o fatiga" },
    ],
    "Cabeza y cuello": [
        { key: "dolorCabeza", label: "Dolor de cabeza", lateral: true },
        { key: "dolorCuello", label: "Dolor o rigidez de cuello", lateral: true },
        { key: "mareos", label: "Mareos o vértigo" },
    ],
    "Oídos, nariz y garganta": [
        { key: "dolorGarganta", label: "Dolor de garganta" },
        { key: "congestionNasal", label: "Congestión nasal" },
        { key: "tos", label: "Tos" },
        { key: "dolorOido", label: "Dolor de oído", lateral: true },
    ],
    "Ojos": [
        { key: "ojosRojos", label: "Ojos rojos", lateral: true },
        { key: "dolorOcular", label: "Dolor en los ojos", lateral: true },
        { key: "visionBorrosa", label: "Visión borrosa" },
    ],
    "Dientes y encías": [
        { key: "dolorDiente", label: "Dolor de dientes o muelas" },
        { key: "enciasSangrantes", label: "Encías sangrantes" },
    ],
    "Respirar": [
        { key: "dificultadRespirar", label: "Dificultad para respirar" },
        { key: "silbidosPecho", label: "Silbidos en el pecho" },
    ],
    "Latidos y pecho": [
        { key: "dolorPecho", label: "Dolor en el pecho" },
        { key: "palpitaciones", label: "Palpitaciones" },
    ],
    "Estómago e intestinos": [
        { key: "nauseasVomitos", label: "Náuseas o vómitos" },
        { key: "dolorAbdominal", label: "Dolor abdominal" },
        { key: "diarrea", label: "Diarrea" },
        { key: "estrenimiento", label: "Estreñimiento" },
    ],
    "Al orinar": [
        { key: "ardorOrinar", label: "Ardor al orinar" },
        { key: "orinaFrecuente", label: "Necesidad de orinar frecuente" },
    ],
    "Músculos y articulaciones": [
        { key: "dolorMuscular", label: "Dolor muscular", lateral: true },
        { key: "dolorArticular", label: "Dolor en articulaciones", lateral: true },
    ],
    "Piel": [
        { key: "erupcion", label: "Erupción o ronchas" },
        { key: "picazon", label: "Picazón" },
    ],
    "Ánimo y estrés": [
        { key: "ansiedad", label: "Ansiedad o nerviosismo" },
        { key: "tristeza", label: "Tristeza o desánimo" },
        { key: "estres", label: "Estrés" },
    ]
};

const desencadenantesOptions = ["Esfuerzo", "Comida", "Frío/Calor", "Estrés", "Reposo mejora", "Medicamento ayuda"];


interface Step2Props {
    datosExtra: DatosExtraJSON;
    updateDatosExtra: (field: keyof DatosExtraJSON, value: any) => void;
}

export function Step2_Sintomas({ datosExtra, updateDatosExtra }: Step2Props) {
    const [isOtroActive, setIsOtroActive] = useState(false);

    const handleCategoryToggle = (cat: string) => {
        const current = new Set(datosExtra.Categorias);
        if (current.has(cat)) current.delete(cat);
        else current.add(cat);
        updateDatosExtra('Categorias', Array.from(current));

        if (isOtroActive) setIsOtroActive(false);
    };

    const handleOtroToggle = () => {
        setIsOtroActive(prev => !prev);
        if (!isOtroActive) {
            updateDatosExtra('Categorias', []); // Deselect other categories
        }
    }

    const handleSymptomToggle = (key: string, label: string) => {
        const currentKeys = new Set(datosExtra.SintomasKeys);
        const currentLabels = new Set(datosExtra.Sintomas);
        const currentDetails = { ...datosExtra.Detalles };

        if (currentKeys.has(key)) {
            currentKeys.delete(key);
            currentLabels.delete(label);
            delete currentDetails[key];
        } else {
            currentKeys.add(key);
            currentLabels.add(label);
            currentDetails[key] = { 
                Intensidad: 5, // Default intensity
                Duracion: { valor: null, unidad: 'días' }
            }; 
        }

        updateDatosExtra('SintomasKeys', Array.from(currentKeys));
        updateDatosExtra('Sintomas', Array.from(currentLabels));
        updateDatosExtra('Detalles', currentDetails);
    };
    
    const handleDetailChange = (key: string, field: keyof DetalleSintoma, value: any) => {
        const currentDetails = {...datosExtra.Detalles};
        if(currentDetails[key]) {
            currentDetails[key] = { ...currentDetails[key], [field]: value };
            updateDatosExtra('Detalles', currentDetails);
        }
    }

    const handleDuracionChange = (key: string, field: 'valor' | 'unidad', value: any) => {
        const currentDetails = {...datosExtra.Detalles};
        if(currentDetails[key]) {
            const newDuracion = { ...currentDetails[key].Duracion, [field]: value };
            handleDetailChange(key, 'Duracion', newDuracion);
        }
    };
    
    const handleDesencadenanteChange = (key: string, value: string) => {
        const currentDetails = {...datosExtra.Detalles};
        if(currentDetails[key]) {
            const currentSet = new Set(currentDetails[key].Desencadenantes || []);
            if (currentSet.has(value)) currentSet.delete(value);
            else currentSet.add(value);
            handleDetailChange(key, 'Desencadenantes', Array.from(currentSet));
        }
    }
    
    const sintomasVisibles = datosExtra.Categorias.flatMap(cat => catalogoSintomas[cat as keyof typeof catalogoSintomas] || []);

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-semibold mb-2">¿En qué parte del cuerpo?</h3>
                <ChipGroup>
                    {Object.keys(catalogoSintomas).map(cat => (
                        <Chip key={cat} multi active={datosExtra.Categorias.includes(cat)} onClick={() => handleCategoryToggle(cat)}>
                            {cat}
                        </Chip>
                    ))}
                    <Chip multi active={isOtroActive} onClick={handleOtroToggle}>
                        Otro
                    </Chip>
                </ChipGroup>
            </div>
            
            {isOtroActive && (
                 <div className="p-4 border-l-4 border-slate-500 bg-slate-50 rounded-r-lg space-y-2 animate-in fade-in-50">
                    <label htmlFor="otro-sintoma-desc" className="font-semibold text-slate-800">Describe lo que sientes</label>
                    <Textarea 
                        id="otro-sintoma-desc"
                        placeholder="Ej: Siento un hormigueo en la mano derecha desde ayer..."
                        value={datosExtra.Detalles['otro']?.Notas || ''}
                        onChange={(e) => {
                             updateDatosExtra('Detalles', { ...datosExtra.Detalles, 'otro': { Notas: e.target.value, Duracion: { valor: null, unidad: null} } });
                             updateDatosExtra('SintomasKeys', ['otro']);
                             updateDatosExtra('Sintomas', ['Otro (descrito)']);
                        }}
                    />
                </div>
            )}

            {!isOtroActive && datosExtra.Categorias.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-2">Tus Síntomas</h3>
                    <ChipGroup>
                        {sintomasVisibles.length > 0 ? sintomasVisibles.map(s => (
                             <Chip key={s.key} multi active={datosExtra.SintomasKeys.includes(s.key)} onClick={() => handleSymptomToggle(s.key, s.label)}>
                                {s.label}
                            </Chip>
                        )) : <p className='text-sm text-muted-foreground'>Selecciona una categoría para ver los síntomas.</p>}
                    </ChipGroup>
                </div>
            )}
            
            {!isOtroActive && datosExtra.SintomasKeys.length > 0 && (
                 <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Detalles de los Síntomas</h3>
                    {datosExtra.SintomasKeys.map(key => {
                        if (key === 'otro') return null;
                        const sintomaLabel = datosExtra.Sintomas[datosExtra.SintomasKeys.indexOf(key)];
                        const detalle = datosExtra.Detalles[key] || { Duracion: { valor: null, unidad: 'días' }};
                        return (
                            <Card key={key} className="bg-slate-50">
                                <CardHeader className='pb-2'>
                                    <div className='flex justify-between items-center'>
                                        <CardTitle className='text-md'>{sintomaLabel}</CardTitle>
                                        <Button variant='ghost' size='icon' onClick={() => handleSymptomToggle(key, sintomaLabel)}><X className='w-4 h-4 text-destructive'/></Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-sm font-medium">Intensidad</label>
                                            <div className='flex items-center gap-4'>
                                                <Slider defaultValue={[5]} min={0} max={10} step={1} onValueChange={(v) => handleDetailChange(key, 'Intensidad', v[0])} />
                                                <Badge variant="secondary" className='w-12 justify-center'>{detalle.Intensidad || 5}/10</Badge>
                                            </div>
                                        </div>
                                        <div className='space-y-2'>
                                            <label className="text-sm font-medium">Duración</label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="number"
                                                    placeholder="Ej: 3"
                                                    className="w-24"
                                                    value={detalle.Duracion.valor ?? ''}
                                                    onChange={(e) => handleDuracionChange(key, 'valor', e.target.valueAsNumber)}
                                                />
                                                <ToggleGroup 
                                                    type="single" 
                                                    variant="outline"
                                                    value={detalle.Duracion.unidad ?? 'días'}
                                                    onValueChange={(v) => handleDuracionChange(key, 'unidad', v || 'días')}
                                                >
                                                    <ToggleGroupItem value="horas">Horas</ToggleGroupItem>
                                                    <ToggleGroupItem value="días">Días</ToggleGroupItem>
                                                </ToggleGroup>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Frecuencia</label>
                                            <ChipGroup>
                                                <Chip active={detalle.Frecuencia === 'Ocasional'} onClick={() => handleDetailChange(key, 'Frecuencia', 'Ocasional')}>Ocasional</Chip>
                                                <Chip active={detalle.Frecuencia === 'A ratos'} onClick={() => handleDetailChange(key, 'Frecuencia', 'A ratos')}>A ratos</Chip>
                                                <Chip active={detalle.Frecuencia === 'Frecuente'} onClick={() => handleDetailChange(key, 'Frecuencia', 'Frecuente')}>Frecuente</Chip>
                                            </ChipGroup>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">¿Algo lo provoca o mejora?</label>
                                        <ChipGroup>
                                            {desencadenantesOptions.map(d => <Chip key={d} multi active={detalle.Desencadenantes?.includes(d)} onClick={() => handleDesencadenanteChange(key, d)}>{d}</Chip>)}
                                        </ChipGroup>
                                    </div>
                                    <Textarea placeholder='Descripción breve (opcional)...' value={detalle.Notas || ''} onChange={(e) => handleDetailChange(key, 'Notas', e.target.value)} />
                                </CardContent>
                            </Card>
                        )
                    })}
                 </div>
            )}
        </div>
    );
}
