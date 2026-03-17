'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { analyzeDocument } from '@/actions/analyze-document';

export function FileUploadComponent() {
    const [file, setFile] = useState<File | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setAnalyzing(true);
        setError(null);

        try {
            const reader = new FileReader();
            reader.onload = async () => {
                const base64 = (reader.result as string).split(',')[1];
                const mimeType = file.type;

                const response = await analyzeDocument(base64, mimeType);

                if (response.success) {
                    setResult(response.data);
                } else {
                    setError(response.error);
                }
                setAnalyzing(false);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            setError('Error al procesar el archivo');
            setAnalyzing(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Análisis de Documentos con IA
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="document">Documento Médico (Imagen o PDF)</Label>
                    <Input id="document" type="file" accept="image/*,application/pdf" onChange={handleFileChange} />
                </div>

                <Button onClick={handleUpload} disabled={!file || analyzing} className="w-full">
                    {analyzing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analizando...
                        </>
                    ) : (
                        <>
                            <FileText className="mr-2 h-4 w-4" />
                            Analizar Documento
                        </>
                    )}
                </Button>

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-md flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        {error}
                    </div>
                )}

                {result && (
                    <div className="mt-4 p-4 bg-green-50 rounded-md border border-green-200">
                        <div className="flex items-center gap-2 mb-2 text-green-700 font-semibold">
                            <CheckCircle className="h-5 w-5" />
                            Análisis Completado
                        </div>
                        <div className="space-y-2 text-sm">
                            <p><strong>Tipo:</strong> {result.tipo_documento}</p>
                            <p><strong>Resumen:</strong> {result.resumen}</p>
                            {result.paciente && <p><strong>Paciente:</strong> {result.paciente}</p>}
                            {result.fecha && <p><strong>Fecha:</strong> {result.fecha}</p>}

                            <div className="mt-2">
                                <strong>Datos Clave:</strong>
                                <pre className="mt-1 p-2 bg-white rounded border text-xs overflow-auto max-h-40">
                                    {JSON.stringify(result.datos_clave, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
