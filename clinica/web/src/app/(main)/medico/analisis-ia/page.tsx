import { FileUploadComponent } from "@/components/shared/FileUploadComponent";

export default function AnalisisIAPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Análisis de Documentos con IA</h1>
                <p className="text-muted-foreground">
                    Sube recetas, exámenes o informes médicos para extraer información automáticamente.
                </p>
            </div>
            <FileUploadComponent />
        </div>
    );
}
