import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  FileText, 
  CheckCircle, 
  Download,
  Stethoscope,
  TestTube,
  Heart
} from 'lucide-react';

const History: React.FC = () => {
  const appointmentHistory = [
    {
      id: '1',
      title: 'Consulta General',
      doctor: 'Dr. López',
      date: '2024-01-15',
      time: '10:00 AM',
      location: 'Sede Centro',
      status: 'completed',
      type: 'consultation',
      icon: Stethoscope,
      notes: 'Revisión general. Signos vitales normales.',
      documents: ['Reporte médico', 'Receta']
    },
    {
      id: '2',
      title: 'Examen de Sangre',
      doctor: 'Lab Central',
      date: '2024-01-10',
      time: '8:30 AM',
      location: 'Sede Norte',
      status: 'completed',
      type: 'lab',
      icon: TestTube,
      notes: 'Análisis completo de sangre. Resultados normales.',
      documents: ['Resultados de laboratorio']
    },
    {
      id: '3',
      title: 'Control Cardiológico',
      doctor: 'Dr. Ana Martínez',
      date: '2024-01-05',
      time: '2:30 PM',
      location: 'Sede Centro',
      status: 'completed',
      type: 'specialist',
      icon: Heart,
      notes: 'Electrocardiograma normal. Continuar tratamiento.',
      documents: ['ECG', 'Reporte cardiológico']
    },
    {
      id: '4',
      title: 'Consulta General',
      doctor: 'Dr. Carlos Pérez',
      date: '2023-12-20',
      time: '11:00 AM',
      location: 'Sede Norte',
      status: 'completed',
      type: 'consultation',
      icon: Stethoscope,
      notes: 'Control rutinario. Paciente estable.',
      documents: ['Reporte médico']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'medical-green';
      case 'pending':
        return 'medical-orange';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Historial Médico
        </h1>
        <p className="text-muted-foreground">
          Consulte el historial completo de sus citas y procedimientos médicos.
        </p>
      </header>

      <div className="space-y-6">
        {appointmentHistory.map((appointment) => (
          <Card key={appointment.id} className="hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg bg-${getStatusColor(appointment.status)}/10 flex items-center justify-center`}>
                    <appointment.icon className={`h-6 w-6 text-${getStatusColor(appointment.status)}`} />
                  </div>
                  <div>
                    <CardTitle className="text-xl mb-2">{appointment.title}</CardTitle>
                    <CardDescription className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Stethoscope className="h-4 w-4" />
                        <span>{appointment.doctor}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>{appointment.date}</span>
                        <Clock className="h-4 w-4 ml-2" />
                        <span>{appointment.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4" />
                        <span>{appointment.location}</span>
                      </div>
                    </CardDescription>
                  </div>
                </div>
                <Badge 
                  variant="secondary"
                  className={`bg-${getStatusColor(appointment.status)}/10 text-${getStatusColor(appointment.status)} border-${getStatusColor(appointment.status)}/20`}
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {getStatusText(appointment.status)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Notes */}
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Notas de la Consulta
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {appointment.notes}
                  </p>
                </div>

                {/* Documents */}
                {appointment.documents.length > 0 && (
                  <div>
                    <h4 className="font-medium text-foreground mb-3">
                      Documentos Disponibles
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {appointment.documents.map((document, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-secondary/30 transition-colors"
                        >
                          <FileText className="h-4 w-4 text-medical-blue" />
                          <span className="text-sm font-medium flex-1">{document}</span>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Descargar {document}</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State - if no history */}
      {appointmentHistory.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="mb-2">No hay historial disponible</CardTitle>
            <CardDescription className="mb-4">
              Aún no tienes citas registradas en el sistema.
            </CardDescription>
            <Button onClick={() => window.location.href = '/schedule'}>
              Agendar Primera Cita
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default History;