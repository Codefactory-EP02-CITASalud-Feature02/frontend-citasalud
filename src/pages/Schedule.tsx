import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin,
  Stethoscope,
  TestTube,
  Heart,
  Eye,
  Brain
} from 'lucide-react';

const Schedule: React.FC = () => {
  const { hasSchedulingAccess } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const examTypes = [
    {
      id: '1',
      name: 'Consulta General',
      duration: '30 min',
      description: 'Consulta médica general con revisión básica',
      icon: Stethoscope,
      color: 'medical-blue'
    },
    {
      id: '2',
      name: 'Exámenes de Laboratorio',
      duration: '15 min',
      description: 'Toma de muestras y análisis clínicos',
      icon: TestTube,
      color: 'medical-green'
    },
    {
      id: '3',
      name: 'Cardiología',
      duration: '45 min',
      description: 'Consulta especializada en cardiología',
      icon: Heart,
      color: 'medical-purple'
    },
    {
      id: '4',
      name: 'Oftalmología',
      duration: '30 min',
      description: 'Examen oftalmológico completo',
      icon: Eye,
      color: 'medical-orange'
    },
    {
      id: '5',
      name: 'Neurología',
      duration: '60 min',
      description: 'Consulta neurológica especializada',
      icon: Brain,
      color: 'medical-blue'
    }
  ];

  const availableSlots = [
    { time: '09:00', available: true },
    { time: '09:30', available: true },
    { time: '10:00', available: false },
    { time: '10:30', available: true },
    { time: '11:00', available: true },
    { time: '11:30', available: false },
    { time: '14:00', available: true },
    { time: '14:30', available: true },
    { time: '15:00', available: true },
    { time: '15:30', available: false },
    { time: '16:00', available: true },
    { time: '16:30', available: true }
  ];

  if (!hasSchedulingAccess) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto text-center">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-destructive">
                Acceso Denegado
              </CardTitle>
              <CardDescription>
                Su rol no tiene permisos para acceder al módulo de agendamiento de citas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Solo los usuarios con roles de Doctor, Administrador o Enfermero 
                pueden acceder a esta funcionalidad.
              </p>
              <Button 
                onClick={() => window.history.back()}
                variant="outline"
              >
                Volver al Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Agendar Cita
        </h1>
        <p className="text-muted-foreground">
          Seleccione el tipo de examen, fecha y horario para su cita médica.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Section */}
        <section className="lg:col-span-1" aria-labelledby="calendar-title">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Seleccionar Fecha
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || date.getDay() === 0}
                className="rounded-md border"
              />
              
              {selectedDate && (
                <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
                  <h3 className="font-medium text-foreground mb-2">
                    Horarios Disponibles
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((slot) => (
                      <Button
                        key={slot.time}
                        variant={slot.available ? "outline" : "ghost"}
                        size="sm"
                        disabled={!slot.available}
                        className="text-xs"
                      >
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Exam Types Section */}
        <section className="lg:col-span-2" aria-labelledby="exam-types-title">
          <Card>
            <CardHeader>
              <CardTitle>Tipos de Exámenes Disponibles</CardTitle>
              <CardDescription>
                Seleccione el tipo de consulta o examen que necesita
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {examTypes.map((exam) => (
                  <Card 
                    key={exam.id}
                    className="hover:shadow-md transition-shadow duration-200 cursor-pointer border-2 hover:border-primary/20"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className={`w-10 h-10 rounded-lg bg-${exam.color}/10 flex items-center justify-center`}>
                          <exam.icon className={`h-5 w-5 text-${exam.color}`} />
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {exam.duration}
                        </Badge>
                      </div>
                      <CardTitle className="text-base">{exam.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {exam.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Button className="w-full" size="sm">
                        Seleccionar
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Location Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Ubicaciones Disponibles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-secondary/50">
                  <h3 className="font-medium text-foreground">Sede Norte</h3>
                  <p className="text-sm text-muted-foreground">
                    Calle 45 #12-34, Medellín
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tel: (604) 123-4567
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <h3 className="font-medium text-foreground">Sede Centro</h3>
                  <p className="text-sm text-muted-foreground">
                    Carrera 50 #67-89, Medellín
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tel: (604) 987-6543
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Schedule;