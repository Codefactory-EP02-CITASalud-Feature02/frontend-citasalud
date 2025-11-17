import React, { useState } from 'react';
import { useAppointments, Appointment as RemoteAppointment } from '@/hooks/useAppointments';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { gqlRequest } from '@/lib/graphqlClient';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  FileText, 
  CheckCircle, 
  XCircle,
  Download,
  Stethoscope,
  TestTube,
  Heart,
  Search,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  Info
} from 'lucide-react';

interface Appointment {
  id: string;
  title: string;
  doctor: string;
  date: string;
  time: string;
  location: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'requires_documents' | 'checked_in' | 'completed' | 'no_show';
  type: 'consultation' | 'lab' | 'specialist' | 'diagnostic';
  icon: typeof Stethoscope;
  notes: string;
  documents: string[];
  category?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  requiredDocuments?: string[];
}

const History: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [cancellingAppointment, setCancellingAppointment] = useState<Appointment | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Use backend-backed appointments via the hook
  const { appointments: remoteAppointments, reloadAppointments } = useAppointments();

  // localOverrides stores UI-only updates like cancellations so the user sees immediate feedback
  const [localOverrides, setLocalOverrides] = useState<Record<string, Partial<Appointment>>>({});

  /*
  Mock data (commented out) — kept here as a fallback in case remote loading fails.
  If you need to re-enable local mocks temporarily, uncomment this block and comment out the
  `useAppointments` hook usage above.

  const [appointmentHistory, setAppointmentHistory] = useState<Appointment[]>([
    {
      id: '1',
      title: 'Radiografía de Tórax',
      doctor: 'Dr. Ana Martínez',
      date: '2025-11-15',
      time: '10:00 AM',
      location: 'Sede Norte',
      status: 'scheduled',
      type: 'diagnostic',
      icon: Heart,
      category: 'Imágenes Diagnósticas',
      notes: 'Radiografía programada para evaluación pulmonar.',
      documents: []
    },
    {
      id: '2',
      title: 'Control Cardiológico',
      doctor: 'Dr. Carlos López',
      date: '2025-09-10',
      time: '2:30 PM',
      location: 'Sede Centro',
      status: 'cancelled',
      type: 'specialist',
      icon: Heart,
      category: 'Cardiología',
      notes: 'Control cardiológico cancelado.',
      documents: [],
      cancellationReason: 'no me dan los horarios',
      cancelledBy: 'Paciente',
      cancelledAt: '27/9/2025, 15:04:03'
    },
    {
      id: '3',
      title: 'Consulta General',
      doctor: 'Dr. María González',
      date: '2025-11-20',
      time: '9:00 AM',
      location: 'Sede Norte',
      status: 'scheduled',
      type: 'consultation',
      icon: Stethoscope,
      category: 'Consulta Médica',
      notes: 'Consulta general programada.',
      documents: []
    },
    {
      id: '4',
      title: 'Exámenes de Rutina',
      doctor: 'Lab. Técnico',
      date: '2025-11-05',
      time: '11:00 AM',
      location: 'Sede Centro',
      status: 'scheduled',
      type: 'lab',
      icon: TestTube,
      category: 'Laboratorio Clínico',
      notes: 'Exámenes de laboratorio de rutina.',
      documents: []
    },
    {
      id: '5',
      title: 'Hemograma Completo',
      doctor: 'Lab. Técnico',
      date: '2024-12-10',
      time: '11:00 AM',
      location: 'Sede Centro',
      status: 'completed',
      type: 'lab',
      icon: TestTube,
      category: 'Laboratorio Clínico',
      notes: 'Análisis completo de sangre. Resultados normales.',
      documents: ['Resultados de laboratorio']
    },
    {
      id: '6',
      title: 'Consulta Especializada',
      doctor: 'Dr. Pedro Ramírez',
      date: '2024-12-05',
      time: '3:00 PM',
      location: 'Sede Sur',
      status: 'cancelled',
      type: 'specialist',
      icon: Stethoscope,
      category: 'Consulta Médica',
      notes: 'Consulta especializada cancelada.',
      documents: [],
      cancellationReason: 'Conflicto de horarios',
      cancelledBy: 'Paciente',
      cancelledAt: '03/12/2024, 14:30:00'
    },
    {
      id: '7',
      title: 'Consulta Dermatológica',
      doctor: 'Dr. Laura Sánchez',
      date: '2025-11-28',
      time: '4:00 PM',
      location: 'Sede Norte',
      status: 'scheduled',
      type: 'specialist',
      icon: Stethoscope,
      category: 'Dermatología',
      notes: 'Consulta dermatológica programada.',
      documents: []
    }
  ]);

  */

  // Map remote appointments to the UI's Appointment shape
  const appointmentHistory: Appointment[] = remoteAppointments.map((r: RemoteAppointment) => {
    const base: Appointment = {
      id: r.id,
      title: r.examType || 'Cita',
      doctor: r.patientName || 'No asignado',
      date: r.date,
      time: r.startTime || '',
      location: r.location || '',
      status: (r.status as Appointment['status']) || 'pending',
      type: 'consultation',
      icon: Stethoscope,
      notes: '',
      documents: [],
      cancellationReason: r.cancellationReason,
      requiredDocuments: r.requiredDocuments,
    };

    // assign a more appropriate icon if exam name suggests lab/diagnostic
    const examLower = (r.examType || '').toLowerCase();
    if (examLower.includes('lab') || examLower.includes('examen') || examLower.includes('hemograma') || examLower.includes('laboratorio')) {
      base.icon = TestTube;
      base.type = 'lab';
    } else if (examLower.includes('radi') || examLower.includes('tomograf') || examLower.includes('resonancia')) {
      base.icon = Heart;
      base.type = 'diagnostic';
    }

    // merge any local overrides (e.g., cancellation performed in UI)
    const override = localOverrides[r.id] || {};
    return { ...base, ...override } as Appointment;
  });

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'confirmed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      case 'requires_documents':
        return 'outline';
      case 'checked_in':
        return 'secondary';
      case 'no_show':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'confirmed':
        return 'Confirmada';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
      case 'requires_documents':
        return 'Requiere Docs';
      case 'checked_in':
        return 'En Sede';
      case 'no_show':
        return 'No Asistió';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-medical-success border-medical-success bg-medical-success/10';
      case 'confirmed':
        return 'text-medical-success border-medical-success bg-medical-success/10';
      case 'pending':
        return 'text-medical-warning border-medical-warning bg-medical-warning/10';
      case 'cancelled':
        return 'text-destructive border-destructive bg-destructive/10';
      case 'requires_documents':
        return 'text-medical-orange border-medical-orange bg-medical-orange/10';
      case 'checked_in':
        return 'text-medical-info border-medical-info bg-medical-info/10';
      case 'no_show':
        return 'text-destructive border-destructive bg-destructive/10';
      default:
        return 'text-muted-foreground border-border bg-muted/10';
    }
  };

  const validateCancellationReason = (reason: string): boolean => {
    if (reason.length === 0) return true; // Optional field
    
    if (reason.length > 500) {
      setReasonError('El motivo no puede exceder 500 caracteres');
      return false;
    }

    // Check for invalid characters (only allow letters, numbers, spaces, and basic punctuation)
    const validPattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,;:()\-¿?¡!]+$/;
    if (!validPattern.test(reason)) {
      setReasonError('El motivo contiene caracteres no permitidos');
      return false;
    }

    setReasonError('');
    return true;
  };

  const handleCancelClick = (appointment: Appointment) => {
    // Check if appointment is in the past or already cancelled
    const appointmentDate = new Date(appointment.date + ' ' + appointment.time);
    const now = new Date();

    if (appointment.status === 'cancelled') {
      toast({
        title: 'No se puede cancelar',
        description: 'Esta cita ya está cancelada.',
        variant: 'destructive',
      });
      return;
    }

    if (appointment.status === 'completed' || appointmentDate < now) {
      toast({
        title: 'No se puede cancelar',
        description: 'No es posible cancelar citas pasadas/ya canceladas.',
        variant: 'destructive',
      });
      return;
    }

    setCancellingAppointment(appointment);
    setCancellationReason('');
    setReasonError('');
    setShowCancelDialog(true);
  };

  const handleConfirmCancellation = () => {
    if (!cancellingAppointment) return;

    if (cancellationReason && !validateCancellationReason(cancellationReason)) {
      return;
    }

    // Update UI immediately
    setLocalOverrides(prev => ({
      ...prev,
      [cancellingAppointment.id]: {
        ...(prev[cancellingAppointment.id] || {}),
        status: 'cancelled',
        cancellationReason: cancellationReason || undefined,
        cancelledBy: 'Paciente',
        cancelledAt: new Date().toLocaleString('es-ES')
      }
    }));

    // Close dialog while we perform the backend mutation
    setShowCancelDialog(false);

    (async () => {
      try {
        // If there's no auth token, we're in mock/dev mode: persist cancellation locally so it survives navigation
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        if (!token) {
          const key = 'medical-app-appointments';
          try {
            const stored = localStorage.getItem(key);
            if (stored) {
              const arr = JSON.parse(stored) as Appointment[];
              const updated = arr.map(a =>
                a.id === cancellingAppointment.id
                  ? { ...a, status: 'cancelled', cancellationReason: cancellationReason || undefined, cancelledBy: 'Paciente', cancelledAt: new Date().toLocaleString('es-ES') }
                  : a
              );
              localStorage.setItem(key, JSON.stringify(updated));
            } else {
              // No stored appointments: create a single cancelled record
              const single: Appointment = {
                id: cancellingAppointment.id,
                title: cancellingAppointment.title,
                doctor: cancellingAppointment.doctor,
                date: cancellingAppointment.date,
                time: cancellingAppointment.time,
                location: cancellingAppointment.location,
                status: 'cancelled',
                type: cancellingAppointment.type,
                icon: cancellingAppointment.icon,
                notes: cancellingAppointment.notes,
                documents: cancellingAppointment.documents,
                cancellationReason: cancellationReason || undefined,
                cancelledBy: 'Paciente',
                cancelledAt: new Date().toLocaleString('es-ES')
              };
              localStorage.setItem(key, JSON.stringify([single]));
            }
          } catch (e) {
            console.error('Error persisting cancellation locally:', e);
          }

          toast({
            title: 'Cita marcada como cancelada (modo local)',
            description: `La cita ha sido marcada como cancelada localmente.`,
          });

          // nothing more to do in mock mode
          setCancellingAppointment(null);
          setCancellationReason('');
          return;
        }

        const mutation = `mutation Cancelar($input: CancelacionInput!) { cancelarExamen(input: $input) { idCita estado motivoCancelacion } }`;
        const variables = { input: { citaId: Number(cancellingAppointment.id), motivo: cancellationReason } };
        await gqlRequest(mutation, variables);

        // Refresh from server to get canonical state
        await reloadAppointments();

        toast({
          title: 'Cita cancelada',
          description: `Su cita de ${cancellingAppointment.title} del ${cancellingAppointment.date} ha sido cancelada. ${cancellationReason ? 'Motivo: ' + cancellationReason + '.' : ''} Se ha notificado al centro médico.`,
        });
      } catch (err) {
        console.error('Error cancelling appointment:', err);
        toast({
          title: 'Error',
          description: 'No se pudo cancelar la cita en el servidor. Intente nuevamente.',
          variant: 'destructive'
        });
        // Optionally revert the optimistic UI: remove the local override
        setLocalOverrides(prev => {
          const copy = { ...prev };
          delete copy[cancellingAppointment.id];
          return copy;
        });
      } finally {
        setCancellingAppointment(null);
        setCancellationReason('');
      }
    })();
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailDialog(true);
  };

  const filteredAppointments = appointmentHistory.filter(apt => {
    const matchesSearch = 
      apt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    confirmed: appointmentHistory.filter(a => a.status === 'confirmed').length,
    pending: appointmentHistory.filter(a => a.status === 'pending').length,
    completed: appointmentHistory.filter(a => a.status === 'completed').length,
    cancelled: appointmentHistory.filter(a => a.status === 'cancelled').length,
    requiresDocuments: appointmentHistory.filter(a => a.status === 'requires_documents').length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Historial de Citas
        </h1>
        <p className="text-muted-foreground">
          Consulte, modifique o cancele sus citas médicas programadas.
        </p>
      </header>

      {/* Search and Filter Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por examen, doctor o sede..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="confirmed">Confirmada</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="completed">Completada</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
                <SelectItem value="requires_documents">Requiere Documentos</SelectItem>
                <SelectItem value="checked_in">En Sede</SelectItem>
                <SelectItem value="no_show">No Asistió</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <div className="space-y-4 mb-8">
        {filteredAppointments.map((appointment) => (
          <Card key={appointment.id} className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left section - Title and Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-xl font-semibold text-foreground">
                      {appointment.title}
                    </h3>
                    <Badge className={getStatusColor(appointment.status)}>
                      {getStatusText(appointment.status)}
                    </Badge>
                    {appointment.cancellationReason && (
                      <Badge variant="outline" className="bg-muted text-muted-foreground">
                        Con motivo
                      </Badge>
                    )}
                    {appointment.status === 'requires_documents' && (
                      <Badge className="bg-medical-orange/10 text-medical-orange border-medical-orange/20">
                        Requiere Documentos
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{appointment.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{appointment.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{appointment.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4" />
                      <span>{appointment.doctor}</span>
                    </div>
                  </div>

                  {appointment.category && (
                    <p className="text-sm text-muted-foreground">
                      {appointment.category}
                    </p>
                  )}
                </div>

                {/* Right section - Actions */}
                <div className="flex items-center gap-2 lg:flex-col lg:items-stretch">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 lg:flex-none"
                    onClick={() => handleViewDetails(appointment)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver
                  </Button>
                  
                  {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 lg:flex-none"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Modificar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 lg:flex-none text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleCancelClick(appointment)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredAppointments.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="mb-2">No se encontraron citas</CardTitle>
            <CardDescription className="mb-4">
              No hay citas que coincidan con tu búsqueda.
            </CardDescription>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas</CardTitle>
          <CardDescription>Resumen de sus citas médicas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-[hsl(var(--medical-success))]">{stats.confirmed}</div>
              <p className="text-sm text-muted-foreground mt-1">Confirmadas</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-[hsl(var(--medical-warning))]">{stats.pending}</div>
              <p className="text-sm text-muted-foreground mt-1">Pendientes</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-[hsl(var(--medical-success))]">{stats.completed}</div>
              <p className="text-sm text-muted-foreground mt-1">Completadas</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-destructive">{stats.cancelled}</div>
              <p className="text-sm text-muted-foreground mt-1">Canceladas</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-[hsl(var(--medical-orange))]">{stats.requiresDocuments}</div>
              <p className="text-sm text-muted-foreground mt-1">Req. Docs</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Detalles de la Cita</DialogTitle>
              {selectedAppointment && (
                <Badge className={getStatusColor(selectedAppointment.status)}>
                  {getStatusText(selectedAppointment.status)}
                </Badge>
              )}
            </div>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              {/* Status Banners */}
              {selectedAppointment.status === 'cancelled' && (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive font-medium">Esta cita ha sido cancelada.</p>
                </div>
              )}

              {selectedAppointment.status === 'requires_documents' && (
                <div className="flex items-start gap-2 p-3 bg-medical-orange/10 border border-medical-orange/20 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-medical-orange shrink-0 mt-0.5" />
                  <p className="text-sm text-medical-orange font-medium">
                    Se requieren documentos adicionales para proceder con esta cita.
                  </p>
                </div>
              )}

              {selectedAppointment.status === 'confirmed' && (
                <div className="flex items-start gap-2 p-3 bg-medical-success/10 border border-medical-success/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-medical-success shrink-0 mt-0.5" />
                  <p className="text-sm text-medical-success font-medium">Su cita ha sido confirmada.</p>
                </div>
              )}

              {selectedAppointment.status === 'pending' && (
                <div className="flex items-start gap-2 p-3 bg-medical-warning/10 border border-medical-warning/20 rounded-lg">
                  <Info className="h-5 w-5 text-medical-warning shrink-0 mt-0.5" />
                  <p className="text-sm text-medical-warning font-medium">Esta cita está pendiente de confirmación.</p>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-lg mb-1">{selectedAppointment.title}</h4>
                <p className="text-sm text-muted-foreground">{selectedAppointment.category}</p>
              </div>

              {/* Appointment Details Card */}
              <div className="border rounded-lg p-4 bg-muted/30">
                <h5 className="font-semibold text-sm mb-3 text-foreground">Detalles de la Cita</h5>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <span className="text-muted-foreground">Fecha</span>
                      <p className="font-medium text-foreground">{selectedAppointment.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <span className="text-muted-foreground">Hora</span>
                      <p className="font-medium text-foreground">{selectedAppointment.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <span className="text-muted-foreground">Sede</span>
                      <p className="font-medium text-foreground">{selectedAppointment.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Stethoscope className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <span className="text-muted-foreground">Profesional</span>
                      <p className="font-medium text-foreground">{selectedAppointment.doctor}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cancellation Info */}
              {selectedAppointment.status === 'cancelled' && selectedAppointment.cancellationReason && (
                <div className="border border-destructive/20 rounded-lg p-4 bg-destructive/5">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-4 w-4 text-destructive" />
                    <h5 className="font-semibold text-sm text-destructive">Información de Cancelación</h5>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Motivo:</span>
                      <p className="text-foreground mt-1">{selectedAppointment.cancellationReason}</p>
                    </div>
                    {selectedAppointment.cancelledBy && (
                      <div className="text-muted-foreground text-xs">
                        Cancelada por: {selectedAppointment.cancelledBy}
                        {selectedAppointment.cancelledAt && ` el ${selectedAppointment.cancelledAt}`}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Required Documents */}
              {selectedAppointment.status === 'requires_documents' && selectedAppointment.requiredDocuments && (
                <div className="border border-medical-orange/20 rounded-lg p-4 bg-medical-orange/5">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4 text-medical-orange" />
                    <h5 className="font-semibold text-sm text-medical-orange">Documentos Requeridos</h5>
                  </div>
                  <ul className="space-y-2">
                    {selectedAppointment.requiredDocuments.map((doc, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-medical-orange mt-1">•</span>
                        <span className="text-foreground">{doc}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Por favor, presente estos documentos al llegar a su cita.
                  </p>
                </div>
              )}

              <Button onClick={() => setShowDetailDialog(false)} className="w-full">
                Cerrar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancellation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-destructive mb-2">
              <AlertCircle className="h-5 w-5" />
              <AlertDialogTitle>Cancelar Cita</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              {cancellingAppointment && (
                <>
                  Está a punto de cancelar la cita de <strong>{cancellingAppointment.title}</strong> programada para 
                  el {cancellingAppointment.date} a las {cancellingAppointment.time}.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cancellation-reason">
                Motivo de cancelación (opcional)
              </Label>
              <Textarea
                id="cancellation-reason"
                placeholder="Ingrese el motivo de la cancelación..."
                value={cancellationReason}
                onChange={(e) => {
                  setCancellationReason(e.target.value);
                  if (e.target.value) {
                    validateCancellationReason(e.target.value);
                  } else {
                    setReasonError('');
                  }
                }}
                className={reasonError ? 'border-destructive' : ''}
                rows={3}
                maxLength={500}
              />
              <div className="flex justify-between items-start">
                {reasonError ? (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    {reasonError}
                  </p>
                ) : (
                  <span />
                )}
                <p className="text-xs text-muted-foreground">
                  {cancellationReason.length}/500
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Esta acción no se puede deshacer. Se enviará una notificación al centro médico.
              </p>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowCancelDialog(false);
              setCancellationReason('');
              setReasonError('');
            }}>
              No, mantener cita
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancellation}
              disabled={!!reasonError}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sí, cancelar cita
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default History;