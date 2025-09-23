import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import PatientBookingFlow from '@/components/booking/PatientBookingFlow';

const Schedule: React.FC = () => {
  const { hasSchedulingAccess } = useAuth();

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
                Solo los usuarios con roles de Doctor, Administrador, Enfermero o Paciente 
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
          Agendar Nueva Cita
        </h1>
        <p className="text-muted-foreground">
          Seleccione la fecha, sede y tipo de examen para su cita médica.
        </p>
      </header>

      <PatientBookingFlow />
    </div>
  );
};

export default Schedule;