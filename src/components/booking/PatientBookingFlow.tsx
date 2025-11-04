import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, MapPinIcon, ClockIcon, CheckCircle2, CircleIcon, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useResourceBlocks } from '@/hooks/useResourceBlocks';
import { useAppointments } from '@/hooks/useAppointments';

interface BookingData {
  date: Date | undefined;
  location: string;
  examType: string;
  specificExam: string;
  time: string;
}

const PatientBookingFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({
    date: undefined,
    location: '',
    examType: '',
    specificExam: '',
    time: ''
  });
  
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isResourceBlocked } = useResourceBlocks();
  const { addAppointment } = useAppointments();

  const steps = [
    { id: 1, title: 'Fecha', label: 'Fecha' },
    { id: 2, title: 'Sede', label: 'Sede' },
    { id: 3, title: 'Tipo', label: 'Tipo' },
    { id: 4, title: 'Confirmar', label: 'Confirmar' }
  ];

  const locations = [
    { id: 'norte', name: 'Sede Norte', available: true },
    { id: 'centro', name: 'Sede Centro', available: true },
    { id: 'sur', name: 'Sede Sur', available: false }
  ];

  const examTypes = {
    'Imágenes Diagnósticas': [
      'Radiografía',
      'Tomografía',
      'Resonancia Magnética',
      'Ecografía'
    ],
    'Laboratorio Clínico': [
      'Hemograma Completo',
      'Química Sanguínea',
      'Perfil Lipídico',
      'Uroanálisis'
    ],
    'Cardiología': [
      'Electrocardiograma',
      'Ecocardiograma',
      'Prueba de Esfuerzo',
      'Holter'
    ]
  };

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00',
    '14:00', '15:00', '16:00', '17:00'
  ];

  const disabledDates = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Disable past dates and weekends
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isPastDate = date < today;
    
    return isPastDate || isWeekend;
  };

  const handleDateSelect = (date: Date | undefined) => {
    setBookingData({ ...bookingData, date });
  };

  const handleLocationSelect = (location: string) => {
    setBookingData({ ...bookingData, location });
  };

  const handleExamTypeSelect = (examType: string) => {
    setBookingData({ ...bookingData, examType, specificExam: '' });
  };

  const handleSpecificExamSelect = (exam: string) => {
    setBookingData({ ...bookingData, specificExam: exam });
  };

  const handleTimeSelect = (time: string) => {
    setBookingData({ ...bookingData, time });
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirmBooking = () => {
    if (!bookingData.date || !user) return;

    // Calculate end time (1 hour after start)
    const startHour = parseInt(bookingData.time.split(':')[0]);
    const endTime = `${String(startHour + 1).padStart(2, '0')}:00`;

    // Save appointment to system
    const locationName = locations.find(l => l.id === bookingData.location)?.name || bookingData.location;
    addAppointment({
      patientName: user.name,
      examType: bookingData.specificExam,
      date: format(bookingData.date, 'yyyy-MM-dd'),
      startTime: bookingData.time,
      endTime: endTime,
      location: locationName,
    });

    // Add notification to localStorage
    const notification = {
      title: 'Cita Confirmada',
      message: `Su cita de ${bookingData.specificExam} ha sido confirmada para el ${format(bookingData.date, "dd/MM/yyyy", { locale: es })} a las ${bookingData.time} en ${locationName}`,
      type: 'confirmation' as const,
      priority: 'high' as const,
      icon: 'Calendar',
      sentVia: 'Email'
    };
    
    const existingNotifications = JSON.parse(localStorage.getItem('medical-app-notifications') || '[]');
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      time: new Date().toLocaleString('es-ES', { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      read: false
    };
    localStorage.setItem('medical-app-notifications', JSON.stringify([newNotification, ...existingNotifications]));
    
    setCurrentStep(5); // Go to success screen
    
    // Simulate notification
    setTimeout(() => {
      toast({
        title: "¡Cita Confirmada!",
        description: "Recibirá un recordatorio por email.",
      });
    }, 500);
  };

  const handleNewBooking = () => {
    setBookingData({
      date: undefined,
      location: '',
      examType: '',
      specificExam: '',
      time: ''
    });
    setCurrentStep(1);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!bookingData.date;
      case 2: return !!bookingData.location;
      case 3: return !!bookingData.examType;
      case 4: return !!bookingData.specificExam && !!bookingData.time;
      default: return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Seleccionar Fecha</CardTitle>
              </div>
              <CardDescription>
                Elija una fecha disponible para su cita
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={bookingData.date}
                onSelect={handleDateSelect}
                disabled={disabledDates}
                locale={es}
                className="rounded-md border shadow-sm"
              />
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <MapPinIcon className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Seleccionar Sede</CardTitle>
              </div>
              <CardDescription>
                Elija la sede donde desea su cita
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {locations.map((location) => (
                <div
                  key={location.id}
                  className={`relative p-4 rounded-lg border-2 transition-all cursor-pointer
                    ${bookingData.location === location.id 
                      ? 'border-primary bg-primary/5' 
                      : location.available 
                        ? 'border-border hover:border-primary/50' 
                        : 'border-border opacity-50 cursor-not-allowed'
                    }`}
                  onClick={() => location.available && handleLocationSelect(location.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{location.name}</span>
                    <Badge variant={location.available ? "default" : "secondary"}>
                      {location.available ? 'Disponible' : 'No Disponible'}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Tipo de Examen</CardTitle>
              <CardDescription>
                Seleccione el tipo de examen que necesita
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.keys(examTypes).map((type) => (
                <div
                  key={type}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer
                    ${bookingData.examType === type 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                    }`}
                  onClick={() => handleExamTypeSelect(type)}
                >
                  <div className="font-medium">{type}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Examen Específico y Hora</CardTitle>
                <CardDescription>
                  Seleccione el examen específico y la hora de su preferencia
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Specific Exam Selection */}
                <div>
                  <h3 className="font-medium mb-3">Examen Específico</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {bookingData.examType && examTypes[bookingData.examType as keyof typeof examTypes]?.map((exam) => (
                      <div
                        key={exam}
                        className={`p-3 rounded-lg border-2 transition-all cursor-pointer text-center
                          ${bookingData.specificExam === exam 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                          }`}
                        onClick={() => handleSpecificExamSelect(exam)}
                      >
                        <span className="text-sm">{exam}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Time Selection */}
                <div>
                  <h3 className="font-medium mb-3">Hora</h3>
                  {bookingData.date && bookingData.specificExam && (
                    <div className="grid grid-cols-4 gap-3">
                      {timeSlots.map((time) => {
                        // Map exam to resource - each exam type can use multiple resources
                        const examToResourceMap: Record<string, string[]> = {
                          'Radiografía': ['sala-rayos-x-1', 'sala-rayos-x-2'],
                          'Tomografía': ['tomografo'],
                          'Resonancia Magnética': ['resonancia-magnetica'],
                          'Ecografía': ['ecografo-principal'],
                          'Electrocardiograma': ['laboratorio-clinico'],
                          'Ecocardiograma': ['laboratorio-clinico'],
                          'Prueba de Esfuerzo': ['laboratorio-clinico'],
                          'Holter': ['laboratorio-clinico'],
                          'Hemograma Completo': ['laboratorio-clinico'],
                          'Química Sanguínea': ['laboratorio-clinico'],
                          'Perfil Lipídico': ['laboratorio-clinico'],
                          'Uroanálisis': ['laboratorio-clinico'],
                        };
                        
                        const resources = examToResourceMap[bookingData.specificExam] || [];
                        const dateStr = format(bookingData.date, 'yyyy-MM-dd');
                        
                        // For exams that require resources (like Radiografía with multiple rooms),
                        // the time is blocked only if ALL required resources are blocked
                        // This allows booking if at least one resource is available
                        const allResourcesBlocked = resources.length > 0 && 
                          resources.every(resource => {
                            const blocked = isResourceBlocked(resource, dateStr, time);
                            console.log(`Checking ${resource} at ${time} on ${dateStr}: ${blocked ? 'BLOCKED' : 'available'}`);
                            return blocked;
                          });
                        
                        console.log(`Time ${time} - All resources blocked: ${allResourcesBlocked}, Resources: ${resources.join(', ')}`);
                        
                        const handleTimeClick = () => {
                          if (allResourcesBlocked) {
                            toast({
                              title: "Horario no disponible",
                              description: "Este horario está bloqueado por mantenimiento.",
                              variant: "destructive",
                            });
                          } else {
                            handleTimeSelect(time);
                          }
                        };
                        
                        return (
                          <div key={time} className="relative pb-3">
                            <Button
                              variant={bookingData.time === time ? "default" : "outline"}
                              className="w-full h-9"
                              onClick={handleTimeClick}
                              disabled={allResourcesBlocked}
                            >
                              {allResourcesBlocked ? (
                                <>
                                  <Lock className="h-3 w-3 mr-1" />
                                  {time}
                                </>
                              ) : (
                                <>
                                  <ClockIcon className="h-3 w-3 mr-1" />
                                  {time}
                                </>
                              )}
                            </Button>
                            {allResourcesBlocked && (
                              <div className="absolute -bottom-0.5 left-0 right-0 text-[9px] font-semibold text-destructive text-center bg-background/80 py-0.5">
                                mantenimiento
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {(!bookingData.date || !bookingData.specificExam) && (
                    <p className="text-sm text-muted-foreground">
                      Seleccione un examen específico para ver horarios disponibles
                    </p>
                  )}
                </div>

                {/* Booking Summary */}
                {bookingData.specificExam && bookingData.time && (
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Resumen de la Cita</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Fecha:</span>
                        <span>{bookingData.date && format(bookingData.date, "d 'de' MMMM 'de' yyyy", { locale: es })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Hora:</span>
                        <span>{bookingData.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Sede:</span>
                        <span>{locations.find(l => l.id === bookingData.location)?.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Examen:</span>
                        <span>{bookingData.specificExam}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 5:
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-green-600">¡Cita Agendada Exitosamente!</h2>
                  <p className="text-muted-foreground">
                    Su cita médica ha sido confirmada. Recibirá un recordatorio por email.
                  </p>
                  
                  <div className="w-full pt-4 space-y-2 text-left">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span>{bookingData.date && format(bookingData.date, "d 'de' MMMM 'de' yyyy", { locale: es })} a las {bookingData.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                      <span>{locations.find(l => l.id === bookingData.location)?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CircleIcon className="h-4 w-4 text-muted-foreground" />
                      <span>{bookingData.specificExam}</span>
                    </div>
                  </div>

                  <Button 
                    onClick={handleNewBooking} 
                    className="w-full mt-4"
                  >
                    Agendar Nueva Cita
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  if (currentStep === 5) {
    return renderStepContent();
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center font-medium transition-colors
                  ${currentStep > step.id 
                    ? 'bg-green-600 text-white' 
                    : currentStep === step.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}
              >
                {currentStep > step.id ? <CheckCircle2 className="h-5 w-5" /> : step.id}
              </div>
              <span className={`text-xs mt-1 ${currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-2 transition-colors ${currentStep > step.id ? 'bg-green-600' : 'bg-muted'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      {renderStepContent()}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          Anterior
        </Button>
        
        {currentStep === 4 ? (
          <Button
            onClick={handleConfirmBooking}
            disabled={!canProceed()}
          >
            Confirmar Cita
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
          >
            Continuar
          </Button>
        )}
      </div>
    </div>
  );
};

export default PatientBookingFlow;