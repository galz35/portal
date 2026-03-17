"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useUserProfile } from '@/hooks/use-user-profile';
import { MedicoService } from '@/lib/services/medico.service';
import { CitaMedica, SeguimientoPaciente } from '@/lib/types/domain';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { DayPicker, type DayProps, type Matcher } from 'react-day-picker';
import 'react-day-picker/dist/style.css';


type CalendarEventType = 'cita' | 'atencion' | 'seguimiento';

interface CalendarEvent {
  id: string;
  date: Date;
  type: CalendarEventType;
  title: string;
  description: string;
  data: CitaMedica | SeguimientoPaciente;
}

const EventBadge = ({ event }: { event: CalendarEvent }) => {
  const typeClasses: Record<CalendarEventType, string> = {
    cita: 'bg-blue-100 text-blue-800 border-blue-200',
    seguimiento: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    atencion: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  return <Badge className={cn("mb-1 block truncate p-1 text-xs font-normal", typeClasses[event.type])}>{event.title}</Badge>;
};

export default function AgendaCalendarioPage() {
  const { userProfile, pais } = useUserProfile();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (userProfile?.idMedico) {
      Promise.all([
        MedicoService.getCitasPorMedico(userProfile.idMedico, { pais }),
        MedicoService.getSeguimientos({ pais })
      ]).then(([citasRes, seguimientosRes]) => {

        const citasEvents = citasRes.map((cita: any): CalendarEvent => ({
          id: `cita-${cita.id_cita}`,
          date: new Date(cita.fecha_cita),
          type: cita.estado_cita === 'FINALIZADA' ? 'atencion' : 'cita',
          title: `${cita.hora_cita} - ${cita.paciente?.nombre_completo || cita.paciente_nombre || 'Paciente'}`,
          description: cita.motivo_resumen || cita.motivo_consulta,
          data: cita
        }));

        const seguimientosEvents = seguimientosRes
          .filter((seg: any) => seg.estado_seguimiento === 'PENDIENTE' && (seg.responsable_nombre?.includes(userProfile?.nombre_completo) || !seg.responsable_nombre))
          .map((seg: any): CalendarEvent => ({
            id: `seg-${seg.id_seguimiento}`,
            date: new Date(seg.fecha_programada),
            type: 'seguimiento',
            title: `Seguimiento: ${seg.paciente_nombre || seg.paciente?.nombre_completo || 'Paciente'}`,
            description: seg.notas_seguimiento || seg.motivo,
            data: seg
          }));

        const allEvents = [...citasEvents, ...seguimientosEvents];
        allEvents.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          if (dateA.getTime() !== dateB.getTime()) {
            return dateA.getTime() - dateB.getTime();
          }
          // If dates are same, sort by time (from title)
          const timeA = (a.title.match(/(\d{2}:\d{2})/) || [])[0];
          const timeB = (b.title.match(/(\d{2}:\d{2})/) || [])[0];
          if (timeA && timeB) return timeA.localeCompare(timeB);
          return 0;
        });

        setEvents(allEvents);
        setLoading(false);
      }).catch(err => {
        console.error("Failed to load calendar data:", err);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [userProfile, pais]);

  const eventDays = useMemo(() => events.map(e => e.date), [events]);

  const eventsByDay = useMemo(() => {
    return events.reduce((acc, event) => {
      const day = event.date.toISOString().split('T')[0];
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(event);
      return acc;
    }, {} as Record<string, CalendarEvent[]>);
  }, [events]);

  const DayWithEvents = useCallback(({ date, displayMonth }: DayProps) => {
    const dayKey = date.toISOString().split('T')[0];
    const dayEvents = eventsByDay[dayKey] || [];
    const isOutside = date.getMonth() !== displayMonth.getMonth();

    if (isOutside) {
      return <div className="p-1 h-24 text-muted-foreground/30">{date.getDate()}</div>;
    }

    if (dayEvents.length === 0) {
      return <div className="p-1 h-24">{date.getDate()}</div>;
    }

    return (
      <Popover>
        <PopoverTrigger asChild>
          <div className="relative flex h-24 w-full flex-col p-1">
            <div>{date.getDate()}</div>
            <div className="flex-1 overflow-y-auto">
              {dayEvents.slice(0, 2).map((event) => (
                <EventBadge key={event.id} event={event} />
              ))}
              {dayEvents.length > 2 && <Badge variant="outline" className="text-xs w-full">+ {dayEvents.length - 2} más</Badge>}
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <h4 className="font-medium leading-none mb-2">Eventos para {date.toLocaleDateString('es-ES')}</h4>
          <div className='max-h-60 overflow-y-auto space-y-2'>
            {dayEvents.map(event => (
              <div key={event.id} className='p-2 rounded-md bg-muted/50'>
                <EventBadge event={event} />
                <p className='text-xs text-muted-foreground mt-1'>{event.description}</p>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  }, [eventsByDay]);


  if (loading) return <div>Cargando agenda...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Agenda del Médico</h1>
        <div className="hidden sm:flex gap-4 items-center text-sm">
          <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-blue-100 border border-blue-200"></span>Cita</div>
          <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-yellow-100 border-yellow-200"></span>Seguimiento</div>
          <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-gray-100 border border-gray-200"></span>Atención</div>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          {/* Desktop Calendar */}
          <DayPicker
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="w-full hidden sm:block"
            classNames={{
              month: 'space-y-4 p-3',
              head_cell: 'w-full',
              table: 'w-full border-collapse',
              row: 'flex w-full mt-2',
              cell: 'w-full text-sm !h-24 rounded-md text-left p-0 focus-within:relative focus-within:z-20',
              day: 'w-full h-full p-1',
            }}
            components={{ Day: DayWithEvents }}
            modifiers={{ events: eventDays }}
            modifiersClassNames={{ events: 'font-bold' }}
          />
          {/* Mobile Calendar */}
          <DayPicker
            mode="single"
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="w-full sm:hidden"
            modifiers={{ haveEvents: eventDays as Matcher | Matcher[] }}
            modifiersClassNames={{ haveEvents: "font-bold text-primary" }}
          />
        </CardContent>
      </Card>
      {/* Mobile Event List */}
      <div className="sm:hidden space-y-2">
        <h2 className="font-bold text-lg">Eventos del Calendario</h2>
        {events.length > 0 ? (
          events.map(event => (
            <Card key={event.id}>
              <CardContent className='p-3'>
                <p className='font-bold'>{event.date.toLocaleDateString('es-ES')}</p>
                <EventBadge event={event} />
                <p className='text-xs text-muted-foreground mt-1'>{event.description}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No hay eventos este mes.</p>
        )}
      </div>
    </div>
  );
}
