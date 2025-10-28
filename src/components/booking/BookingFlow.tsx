import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin,
  Stethoscope,
  TestTube,
  Heart,
  Eye,
  Brain,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Building2
} from 'lucide-react';

interface BookingData {
  date: Date | null;
  location: string | null;
  examType: string | null;
  specificExam: string | null;
  time: string | null;
}

const BookingFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({
    date: null,
    location: null,
    examType: null,
    specificExam: null,
    time: null
  });
  const { toast } = useToast();

  const locations = [
    {
      id: 'norte',
      name: 'Sede Norte',
      address: 'Calle 45 #12-34, Medellín',
      phone: '(604) 123-4567',
      available: true
    },
    {
      id: 'centro',
      name: 'Sede Centro',
      address: 'Carrera 50 #67-89, Medellín',
      phone: '(604) 987-6543',
      available: true
    },
    {
      id: 'sur',
      name: 'Sede Sur',
      address: 'Calle 30 Sur #25-15, Medellín',
      phone: '(604) 555-0123',
      available: false
    }
  ];

  const examTypes = [
    {
      id: 'laboratorio',
      name: 'Exámenes de Laboratorio',
      description: 'Análisis clínicos y toma de muestras',
      icon: TestTube,
      color: 'medical-green'
    },
    {
      id: 'cardiologia',
      name: 'Cardiología',
      description: 'Consultas y exámenes especializados del corazón',
      icon: Heart,
      color: 'medical-red'
    },
    {
      id: 'oftalmologia',
      name: 'Oftalmología',
      description: 'Exámenes oftalmológicos completos',
      icon: Eye,
      color: 'medical-orange'
    },
    {
      id: 'neurologia',
      name: 'Neurología',
      description: 'Consultas neurológicas especializadas',
      icon: Brain,
      color: 'medical-purple'
    }
  ];

  const specificExams = {
    laboratorio: [
      { id: 'hemograma', name: 'Hemograma Completo', duration: '15 min' },
      { id: 'glucosa', name: 'Glucosa en Sangre', duration: '10 min' },
      { id: 'colesterol', name: 'Perfil Lipídico', duration: '15 min' },
      { id: 'orina', name: 'Examen de Orina', duration: '10 min' }
    ],
    cardiologia: [
      { id: 'ekg', name: 'Electrocardiograma', duration: '30 min' },
      { id: 'ecocardiograma', name: 'Ecocardiograma', duration: '45 min' },
      { id: 'holter', name: 'Holter 24 horas', duration: '15 min' },
      { id: 'stress', name: 'Prueba de Esfuerzo', duration: '60 min' }
    ],
    oftalmologia: [
      { id: 'agudeza', name: 'Agudeza Visual', duration: '20 min' },
      { id: 'campo', name: 'Campo Visual', duration: '30 min' },
      { id: 'retina', name: 'Examen de Retina', duration: '25 min' },
      { id: 'presion', name: 'Presión Ocular', duration: '15 min' }
    ],
    neurologia: [
      { id: 'eeg', name: 'Electroencefalograma', duration: '45 min' },
      { id: 'resonancia', name: 'Resonancia Magnética', duration: '60 min' },
      { id: 'tomografia', name: 'Tomografía Cerebral', duration: '30 min' },
      { id: 'doppler', name: 'Doppler Cerebral', duration: '40 min' }
    ]
  };

  const availableTimeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  const steps = [
    { number: 1, title: 'Seleccionar Fecha', description: 'Elija la fecha para su cita' },
    { number: 2, title: 'Seleccionar Sede', description: 'Elija la ubicación' },
    { number: 3, title: 'Tipo de Examen', description: 'Seleccione la especialidad' },
    { number: 4, title: 'Examen Específico', description: 'Detalles y horario' },
    { number: 5, title: 'Confirmación', description: 'Revise y confirme' }
  ];

  const getProgress = () => (currentStep / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setBookingData({ ...bookingData, date });
    }
  };

  const handleLocationSelect = (locationId: string) => {
    setBookingData({ ...bookingData, location: locationId });
  };

  const handleExamTypeSelect = (examTypeId: string) => {
    setBookingData({ ...bookingData, examType: examTypeId, specificExam: null });
  };

  const handleSpecificExamSelect = (examId: string) => {
    setBookingData({ ...bookingData, specificExam: examId });
  };

  const handleTimeSelect = (time: string) => {
    setBookingData({ ...bookingData, time });
  };

  const handleConfirmBooking = () => {
    // Add notification to localStorage
    const notification = {
      title: 'Cita Confirmada',
      message: `Su cita de ${selectedSpecificExam?.name} ha sido confirmada para el ${bookingData.date?.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })} a las ${bookingData.time} en ${selectedLocation?.name}`,
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
    
    toast({
      title: "¡Cita Agendada Exitosamente!",
      description: "Su cita ha sido confirmada. Recibirá una notificación de confirmación.",
    });
    
    // Reset the flow
    setCurrentStep(1);
    setBookingData({
      date: null,
      location: null,
      examType: null,
      specificExam: null,
      time: null
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return bookingData.date !== null;
      case 2: return bookingData.location !== null;
      case 3: return bookingData.examType !== null;
      case 4: return bookingData.specificExam !== null && bookingData.time !== null;
      case 5: return true;
      default: return false;
    }
  };

  const selectedLocation = locations.find(loc => loc.id === bookingData.location);
  const selectedExamType = examTypes.find(type => type.id === bookingData.examType);
  const selectedSpecificExam = bookingData.examType ? 
    specificExams[bookingData.examType as keyof typeof specificExams]?.find(exam => exam.id === bookingData.specificExam) : null;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Seleccionar Fecha
              </CardTitle>
              <CardDescription>
                Elija la fecha en la que desea programar su cita médica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={bookingData.date || undefined}
                onSelect={handleDateSelect}
                disabled={(date) => date < new Date() || date.getDay() === 0}
                className="rounded-md border mx-auto"
              />
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Seleccionar Sede
              </CardTitle>
              <CardDescription>
                Elija la sede donde desea realizarse el examen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {locations.filter(loc => loc.available).map((location) => (
                  <Card 
                    key={location.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      bookingData.location === location.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleLocationSelect(location.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Building2 className="h-5 w-5 text-medical-blue mt-1" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{location.name}</h3>
                          <p className="text-sm text-muted-foreground">{location.address}</p>
                          <p className="text-sm text-muted-foreground">{location.phone}</p>
                        </div>
                        {bookingData.location === location.id && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Tipo de Examen</CardTitle>
              <CardDescription>
                Seleccione la especialidad médica correspondiente a su examen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {examTypes.map((examType) => (
                  <Card 
                    key={examType.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      bookingData.examType === examType.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleExamTypeSelect(examType.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className={`w-10 h-10 rounded-lg bg-${examType.color}/10 flex items-center justify-center`}>
                          <examType.icon className={`h-5 w-5 text-${examType.color}`} />
                        </div>
                        {bookingData.examType === examType.id && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <CardTitle className="text-base">{examType.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {examType.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Examen Específico</CardTitle>
                <CardDescription>
                  Seleccione el examen específico que necesita
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {bookingData.examType && specificExams[bookingData.examType as keyof typeof specificExams]?.map((exam) => (
                    <Card 
                      key={exam.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        bookingData.specificExam === exam.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => handleSpecificExamSelect(exam.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-foreground">{exam.name}</h3>
                            <Badge variant="secondary" className="text-xs mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              {exam.duration}
                            </Badge>
                          </div>
                          {bookingData.specificExam === exam.id && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {bookingData.specificExam && (
              <Card>
                <CardHeader>
                  <CardTitle>Seleccionar Horario</CardTitle>
                  <CardDescription>
                    Elija el horario que mejor se adapte a su disponibilidad
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-2">
                    {availableTimeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={bookingData.time === time ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleTimeSelect(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 5:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-primary" />
                Resumen de la Cita
              </CardTitle>
              <CardDescription>
                Revise los detalles de su cita antes de confirmar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-secondary/20 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha:</span>
                  <span className="font-medium">
                    {bookingData.date?.toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hora:</span>
                  <span className="font-medium">{bookingData.time}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sede:</span>
                  <span className="font-medium">{selectedLocation?.name}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo de Examen:</span>
                  <span className="font-medium">{selectedExamType?.name}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Examen Específico:</span>
                  <span className="font-medium">{selectedSpecificExam?.name}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duración:</span>
                  <span className="font-medium">{selectedSpecificExam?.duration}</span>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={handleConfirmBooking}
                  className="w-full"
                  size="lg"
                >
                  Confirmar Cita
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Paso {currentStep} de {steps.length}</span>
              <span>{Math.round(getProgress())}% completado</span>
            </div>
            <Progress value={getProgress()} className="w-full" />
            
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">{steps[currentStep - 1].title}</h2>
                <p className="text-sm text-muted-foreground">{steps[currentStep - 1].description}</p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                
                {currentStep < steps.length ? (
                  <Button
                    size="sm"
                    onClick={handleNext}
                    disabled={!canProceed()}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {renderStepContent()}
    </div>
  );
};

export default BookingFlow;