import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
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
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useResourceBlocks } from '@/hooks/useResourceBlocks';
import { toast } from '@/hooks/use-toast';
import { 
  Calendar as CalendarIcon,
  Plus,
  Lock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  List,
  Info,
  Trash2,
  Filter,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { parseLocalDate } from '@/lib/utils';

// Available resources
const AVAILABLE_RESOURCES = [
  { id: 'ecografo-principal', name: 'Ecógrafo Principal', type: 'Equipo' },
  { id: 'resonancia-magnetica', name: 'Resonancia Magnética', type: 'Equipo' },
  { id: 'tomografo', name: 'Tomógrafo', type: 'Equipo' },
  { id: 'sala-rayos-x-1', name: 'Sala Rayos X 1', type: 'Sala' },
  { id: 'sala-rayos-x-2', name: 'Sala Rayos X 2', type: 'Sala' },
  { id: 'laboratorio-clinico', name: 'Laboratorio Clínico', type: 'Sala' },
];

const ResourceBlocks: React.FC = () => {
  const { user } = useAuth();
  const { blocks, addBlock, removeBlock, getBlocksForDateRange } = useResourceBlocks();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewFilter, setViewFilter] = useState<'all' | 'blocks' | 'appointments'>('all');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'calendar' | 'list'>('calendar');

  // Form state
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [reason, setReason] = useState('');
  const [recurrence, setRecurrence] = useState<'none' | 'weekly' | 'monthly'>('none');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | undefined>();

  // Check admin access
  if (user?.role !== 'admin') {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto text-center">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-destructive">
                Acceso Denegado
              </CardTitle>
              <CardDescription>
                Solo los administradores pueden acceder a la gestión de bloqueos de recursos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Esta funcionalidad está reservada para usuarios con rol de Administrador.
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

  // Sample appointments data (would come from real data)
  const sampleAppointments = [
    { id: '1', date: '2025-10-30', time: '09:00', patient: 'María García', resource: 'ecografo-principal' },
    { id: '2', date: '2025-10-30', time: '14:00', patient: 'Carlos Rodríguez', resource: 'ecografo-principal' },
    { id: '3', date: '2025-10-29', time: '10:00', patient: 'Ana Martínez', resource: 'resonancia-magnetica' },
    { id: '4', date: '2025-10-30', time: '11:00', patient: 'Pedro López', resource: 'sala-rayos-x-1' },
  ];

  const handleToggleResource = (resourceId: string) => {
    setSelectedResources(prev =>
      prev.includes(resourceId)
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    );
  };

  const validateForm = (): boolean => {
    if (selectedResources.length === 0) {
      toast({
        title: 'Error de Validación',
        description: 'Debe seleccionar al menos un recurso para bloquear.',
        variant: 'destructive',
      });
      return false;
    }

    if (!startDate || !endDate) {
      toast({
        title: 'Error de Validación',
        description: 'Debe seleccionar fechas de inicio y fin.',
        variant: 'destructive',
      });
      return false;
    }

    if (endDate < startDate) {
      toast({
        title: 'Error de Validación',
        description: 'La fecha de fin debe ser posterior a la fecha de inicio.',
        variant: 'destructive',
      });
      return false;
    }

    if (endTime <= startTime) {
      toast({
        title: 'Error de Validación',
        description: 'La hora de fin debe ser posterior a la hora de inicio.',
        variant: 'destructive',
      });
      return false;
    }

    if (!reason.trim()) {
      toast({
        title: 'Error de Validación',
        description: 'Debe especificar un motivo para el bloqueo.',
        variant: 'destructive',
      });
      return false;
    }

    if (reason.length > 500) {
      toast({
        title: 'Error de Validación',
        description: 'El motivo no puede exceder 500 caracteres.',
        variant: 'destructive',
      });
      return false;
    }

    if (recurrence !== 'none' && !recurrenceEndDate) {
      toast({
        title: 'Error de Validación',
        description: 'Debe especificar fecha de fin para bloqueos recurrentes.',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleCreateBlock = () => {
    if (!validateForm() || !startDate || !endDate || !user) return;

    const newBlock = addBlock({
      resources: selectedResources,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      startTime,
      endTime,
      reason: reason.trim(),
      recurrence,
      recurrenceEndDate: recurrenceEndDate ? format(recurrenceEndDate, 'yyyy-MM-dd') : undefined,
      createdBy: user.name,
    });

    toast({
      title: 'Bloqueo creado exitosamente',
      description: `Se ha bloqueado ${selectedResources.length} recurso(s) desde ${format(startDate, 'dd/MM/yyyy')} hasta ${format(endDate, 'dd/MM/yyyy')}.`,
    });

    // Reset form
    setShowCreateDialog(false);
    setSelectedResources([]);
    setStartDate(undefined);
    setEndDate(undefined);
    setStartTime('09:00');
    setEndTime('10:00');
    setReason('');
    setRecurrence('none');
    setRecurrenceEndDate(undefined);
  };

  const handleDeleteBlock = (blockId: string) => {
    removeBlock(blockId);
    toast({
      title: 'Bloqueo eliminado',
      description: 'El bloqueo ha sido eliminado exitosamente.',
    });
  };

  // Calendar helpers
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getBlocksForDay = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    // Reset time to start of day for comparison
    const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    
    return blocks.filter(block => {
      const blockStart = parseLocalDate(block.startDate);
      const blockEnd = parseLocalDate(block.endDate);
      // Set to end of day for inclusive comparison
      blockEnd.setHours(23, 59, 59, 999);
      return dayStart >= blockStart && dayStart <= blockEnd;
    });
  };

  const getAppointmentsForDay = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    return sampleAppointments.filter(apt => apt.date === dayStr);
  };

  const filteredBlocks = useMemo(() => {
    let result = blocks;
    
    if (resourceFilter !== 'all') {
      result = result.filter(block => block.resources.includes(resourceFilter));
    }

    return result;
  }, [blocks, resourceFilter]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Gestión de Bloqueos de Recursos
            </h1>
            <p className="text-muted-foreground">
              Administra bloqueos de equipos y salas para mantenimiento o situaciones externas
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Crear Bloqueo
          </Button>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Los bloqueos impiden que se agenden citas en los recursos seleccionados durante el periodo especificado. Las citas existentes deben ser canceladas o reprogramadas manualmente.
          </AlertDescription>
        </Alert>
      </header>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'calendar' | 'list')} className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList>
            <TabsTrigger value="calendar">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Calendario
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="h-4 w-4 mr-2" />
              Lista de Bloqueos
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Select value={viewFilter} onValueChange={(v) => setViewFilter(v as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Mostrar todo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Mostrar todo</SelectItem>
                <SelectItem value="blocks">Solo bloqueos</SelectItem>
                <SelectItem value="appointments">Solo citas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={resourceFilter} onValueChange={setResourceFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todos los recursos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los recursos</SelectItem>
                {AVAILABLE_RESOURCES.map(resource => (
                  <SelectItem key={resource.id} value={resource.id}>
                    {resource.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Calendario de Bloqueos y Citas</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date())}
                  >
                    Hoy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-semibold ml-4">
                    {format(currentDate, 'MMMM yyyy', { locale: es })}
                  </span>
                </div>
              </div>
              <CardDescription>
                Visualiza y gestiona bloqueos de recursos y citas programadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-destructive/20 border border-destructive/40 rounded" />
                  <span>Bloqueo</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-muted border border-border rounded" />
                  <span>Cita programada</span>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="border rounded-lg overflow-hidden">
                {/* Days of week header */}
                <div className="grid grid-cols-7 bg-muted/50">
                  {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground border-r last:border-r-0">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7">
                  {/* Empty cells for days before month starts */}
                  {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} className="min-h-[120px] p-2 border-r border-b bg-muted/20" />
                  ))}

                  {/* Actual days */}
                  {daysInMonth.map((day) => {
                    const dayBlocks = getBlocksForDay(day);
                    const dayAppointments = getAppointmentsForDay(day);
                    const isToday = isSameDay(day, new Date());

                    const showBlocks = viewFilter === 'all' || viewFilter === 'blocks';
                    const showAppointments = viewFilter === 'all' || viewFilter === 'appointments';

                    return (
                      <div
                        key={day.toISOString()}
                        className={`min-h-[120px] p-2 border-r border-b last:border-r-0 ${
                          isToday ? 'bg-primary/5 border-primary/20' : ''
                        }`}
                      >
                        <div className={`text-sm font-medium mb-2 ${isToday ? 'text-primary' : 'text-foreground'}`}>
                          {format(day, 'd')}
                        </div>

                        <div className="space-y-1">
                          {showBlocks && dayBlocks.slice(0, 2).map((block) => (
                            <div
                              key={block.id}
                              className="text-xs p-1 rounded bg-destructive/20 border border-destructive/40 flex items-start gap-1"
                            >
                              <Lock className="h-3 w-3 text-destructive flex-shrink-0 mt-0.5" />
                              <span className="line-clamp-2 text-destructive">
                                {AVAILABLE_RESOURCES.find(r => r.id === block.resources[0])?.name || 'Recurso'}
                              </span>
                            </div>
                          ))}
                          
                          {showAppointments && dayAppointments.slice(0, 2).map((apt) => (
                            <div
                              key={apt.id}
                              className="text-xs p-1 rounded bg-muted border border-border"
                            >
                              <div className="font-medium">{apt.patient}</div>
                              <div className="text-muted-foreground">{apt.time}</div>
                            </div>
                          ))}

                          {(dayBlocks.length + dayAppointments.length) > 2 && (
                            <div className="text-xs text-muted-foreground text-center">
                              +{dayBlocks.length + dayAppointments.length - 2} más
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Bloqueos Activos</CardTitle>
              <CardDescription>
                Todos los bloqueos de recursos programados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredBlocks.length === 0 ? (
                <div className="text-center py-12">
                  <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay bloqueos activos</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBlocks.map((block) => (
                    <div
                      key={block.id}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4 text-destructive" />
                            <h4 className="font-semibold">{block.reason}</h4>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {block.resources.map((resourceId) => {
                              const resource = AVAILABLE_RESOURCES.find(r => r.id === resourceId);
                              return (
                                <Badge key={resourceId} variant="outline">
                                  {resource?.name || resourceId}
                                </Badge>
                              );
                            })}
                          </div>

                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>
                              <strong>Periodo:</strong> {block.startDate} al {block.endDate}
                            </div>
                            <div>
                              <strong>Horario:</strong> {block.startTime} - {block.endTime}
                            </div>
                            {block.recurrence !== 'none' && (
                              <div>
                                <strong>Recurrencia:</strong> {
                                  block.recurrence === 'weekly' ? 'Semanal' : 'Mensual'
                                } hasta {block.recurrenceEndDate}
                              </div>
                            )}
                            <div>
                              <strong>Creado por:</strong> {block.createdBy}
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteBlock(block.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Block Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Bloqueo</DialogTitle>
            <DialogDescription>
              Bloquea franjas horarias para mantenimiento de equipos o situaciones externas
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Resources Selection */}
            <div className="space-y-3">
              <Label className="text-base">Recursos a Bloquear *</Label>
              <div className="border rounded-lg p-4 max-h-[200px] overflow-y-auto space-y-2">
                {AVAILABLE_RESOURCES.map((resource) => (
                  <div key={resource.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={resource.id}
                      checked={selectedResources.includes(resource.id)}
                      onCheckedChange={() => handleToggleResource(resource.id)}
                    />
                    <label
                      htmlFor={resource.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {resource.name} ({resource.type})
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha de Inicio *</Label>
                <Input
                  type="date"
                  value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : undefined)}
                />
              </div>
              <div className="space-y-2">
                <Label>Fecha de Fin *</Label>
                <Input
                  type="date"
                  value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : undefined)}
                />
              </div>
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hora de Inicio *</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Hora de Fin *</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label>Motivo del Bloqueo *</Label>
              <Textarea
                placeholder="Ej: Mantenimiento preventivo del equipo, calibración, falta de personal..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={500}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                {reason.length}/500 caracteres
              </p>
            </div>

            {/* Recurrence */}
            <div className="space-y-3">
              <Label>Recurrencia</Label>
              <Select value={recurrence} onValueChange={(v) => setRecurrence(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sin recurrencia (única vez)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin recurrencia (única vez)</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensual</SelectItem>
                </SelectContent>
              </Select>

              {recurrence !== 'none' && (
                <div className="space-y-2">
                  <Label>Fecha de Fin de Recurrencia *</Label>
                  <Input
                    type="date"
                    value={recurrenceEndDate ? format(recurrenceEndDate, 'yyyy-MM-dd') : ''}
                    onChange={(e) => setRecurrenceEndDate(e.target.value ? new Date(e.target.value) : undefined)}
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateBlock}>
                Crear Bloqueo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResourceBlocks;
