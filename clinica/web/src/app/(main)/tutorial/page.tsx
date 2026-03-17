import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function TutorialPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Ayuda y Tutorial</h1>
      <p className="text-muted-foreground">
        Bienvenido a la guía de uso de Claro Mi Salud. Aquí encontrarás cómo utilizar las funciones principales de la aplicación según tu rol.
      </p>

      <Accordion type="multiple" className="w-full">
        <AccordionItem value="paciente">
          <AccordionTrigger className="text-xl font-semibold">Guía para Pacientes</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>1. Cómo Solicitar una Cita (Chequeo de Bienestar)</CardTitle>
                <CardDescription>Esta es la función principal para reportar tu estado de salud y, si es necesario, iniciar una solicitud de atención médica.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-muted-foreground">
                <p>El proceso consta de 4 sencillos pasos:</p>
                <ul className="list-decimal list-inside space-y-2 pl-4">
                  <li><strong>Paso 1: Tu estado hoy.</strong> Indica si te sientes bien o tienes alguna molestia. Si te sientes bien, el proceso es más corto y solo te preguntará por insumos y un comentario opcional. Si tienes molestias, continuarás con los siguientes pasos.</li>
                  <li><strong>Paso 2: ¿Qué te molesta?.</strong> Si tienes molestias, primero selecciona la parte del cuerpo afectada (Cabeza, Piel, etc.) y luego los síntomas específicos. Por cada síntoma que agregues, podrás detallar:
                      <ul className='list-disc list-inside pl-6 mt-1'>
                          <li><strong>Intensidad:</strong> En una escala del 1 al 10.</li>
                          <li><strong>Duración:</strong> Ingresa un número y elige si son "Horas" o "Días".</li>
                          <li><strong>Frecuencia:</strong> Si es ocasional, a ratos o frecuente.</li>
                      </ul>
                  </li>
                  <li><strong>Paso 3: Hábitos y bienestar.</strong> Responde preguntas clave sobre si tienes alergias activas, cómo dormiste, tu consumo de agua y tu estado de ánimo. También se te preguntará si te sientes apto para laborar; si respondes "No", deberás indicar el porqué.</li>
                  <li><strong>Paso 4: Revisión y envío.</strong> Confirma un resumen de tu información, añade un comentario final si lo deseas y envía tu solicitud. El equipo médico la revisará y se pondrá en contacto contigo.</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Consultar Mis Citas</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>En la sección <strong>"Mis Citas"</strong>, podrás ver un resumen de tu próxima cita programada, así como un historial completo de todas tus citas (programadas, finalizadas o canceladas).</p>
              </CardContent>
            </Card>

             <Card>
              <CardHeader>
                <CardTitle>3. Ver Mis Chequeos y Exámenes</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>En <strong>"Mis Chequeos"</strong> encontrarás el historial de todos los chequeos de bienestar que has enviado. En <strong>"Mis Exámenes"</strong>, podrás ver los exámenes que te han solicitado y, una vez que el resultado esté listo, podrás consultarlo haciendo clic en el ícono del ojo.</p>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="medico">
          <AccordionTrigger className="text-xl font-semibold">Guía para Médicos</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>1. Gestión de Citas (Triaje)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-muted-foreground">
                <p>En la sección <strong>"Gestión de Citas"</strong> verás todas las solicitudes de pacientes que están pendientes de ser agendadas. Es el primer punto de contacto.</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li><strong>Agendar:</strong> Haz clic en "Agendar" para abrir un formulario donde puedes asignar una fecha, hora y médico a la solicitud, creando así una cita formal en el sistema.</li>
                  <li><strong>Cancelar:</strong> Si una solicitud no procede o es duplicada, puedes cancelarla especificando un motivo.</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>2. Realizar una Atención Médica</CardTitle>
                <CardDescription>Desde el Dashboard o la Agenda, al hacer clic en "Atender" en una cita programada, iniciarás el asistente de atención médica de 5 pasos.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-muted-foreground">
                <ul className="list-decimal list-inside space-y-2 pl-4">
                  <li><strong>Paso 1: Resumen.</strong> Revisa los detalles de la cita y el contexto reportado por el paciente, incluyendo su nivel de semáforo y la información psicosocial que haya proporcionado.</li>
                  <li><strong>Paso 2: Signos Vitales.</strong> Registra los signos vitales (temperatura, peso, etc.) y define el estado clínico general del paciente en esta consulta (Bien, Regular, Mal).</li>
                  <li><strong>Paso 3: Diagnóstico y Plan.</strong> Escribe el diagnóstico principal (ej: Faringoamigdalitis viral), el plan de tratamiento (medicamentos, dosis) y las recomendaciones generales (reposo, dieta).</li>
                  <li><strong>Paso 4: Seguimiento.</strong> Decide si el paciente necesita una nueva cita de seguimiento. Si activas la opción, puedes programar una fecha y tipo de cita, lo que generará una tarea automática en el sistema.</li>
                  <li><strong>Paso 5: Acciones Adicionales y Cierre.</strong> Registra acciones específicas de la empresa (como vacunas), anota información psicosocial confidencial (opcional) y revisa un resumen final antes de guardar toda la atención.</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Gestionar Seguimientos</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>En <strong>"Seguimientos"</strong>, verás todas las tareas de seguimiento pendientes. Puedes hacer clic en las acciones para:</p>
                 <ul className="list-disc list-inside space-y-1 pl-4">
                  <li><strong>Registrar Nota:</strong> Añade una nueva nota sobre el seguimiento (ej: "Se llamó al paciente, reporta mejoría").</li>
                  <li><strong>Actualizar Estado:</strong> Cambia el estado del seguimiento de "Pendiente" a "En Proceso" o "Resuelto" una vez que la acción se haya completado.</li>
                  <li><strong>Ver Caso Asociado:</strong> Navega directamente al detalle del caso clínico al que pertenece el seguimiento.</li>
                </ul>
              </CardContent>
            </Card>

             <Card>
              <CardHeader>
                <CardTitle>4. Consultar Agenda y Casos</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>Usa la <strong>"Agenda (Calendario)"</strong> para ver tus citas y seguimientos en una vista de mes. En <strong>"Pacientes y Casos"</strong>, puedes buscar y consultar el historial clínico completo de cualquier paciente en el sistema.</p>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
