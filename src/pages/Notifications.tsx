import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  Info,
  Trash2,
  Settings,
  Mail,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'confirmation' | 'cancelled' | 'results' | 'system';
  priority: 'high' | 'medium' | 'low';
  time: string;
  read: boolean;
  icon: string;
  sentVia: string;
}

const Notifications: React.FC = () => {
  const [emailReminders, setEmailReminders] = useState(true);
  const [smsReminders, setSmsReminders] = useState(true);
  const [systemNotifications, setSystemNotifications] = useState(true);
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [resultNotifications, setResultNotifications] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const { toast } = useToast();

  // Load notifications from localStorage
  useEffect(() => {
    const loadNotifications = () => {
      const stored = localStorage.getItem('medical-app-notifications');
      if (stored) {
        try {
          setNotifications(JSON.parse(stored));
        } catch (error) {
          console.error('Error loading notifications:', error);
        }
      }
    };
    
    loadNotifications();
    
    // Listen for storage changes (when notifications are added)
    const handleStorageChange = () => {
      loadNotifications();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically in case localStorage was updated in the same tab
    const interval = setInterval(loadNotifications, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const sampleNotifications: NotificationItem[] = [
    {
      id: '1',
      title: 'Recordatorio de Cita',
      message: 'Su cita de Radiografía de Tórax es mañana a las 10:00 AM en Sede Norte',
      type: 'reminder',
      priority: 'high',
      time: '2025-01-14 • 09:00',
      read: false,
      icon: 'AlertCircle',
      sentVia: 'Email y SMS'
    },
    {
      id: '2',
      title: 'Cita Confirmada',
      message: 'Su cita de Control Cardiológico ha sido confirmada para el 08 de octubre a las 2:30 PM',
      type: 'confirmation',
      priority: 'medium',
      time: '2025-10-08 • 14:30',
      read: false,
      icon: 'Calendar',
      sentVia: 'Email'
    },
    {
      id: '3',
      title: 'Cita Cancelada',
      message: 'Su cita de Consulta Especializada del 5 de diciembre ha sido cancelada. Motivo: Conflicto de horarios. Se ha notificado al centro médico.',
      type: 'cancelled',
      priority: 'medium',
      time: '2024-12-03 • 14:30',
      read: false,
      icon: 'AlertCircle',
      sentVia: 'Email y SMS'
    },
    {
      id: '4',
      title: 'Resultados Disponibles',
      message: 'Los resultados de su examen de sangre ya están disponibles para descarga.',
      type: 'results',
      priority: 'medium',
      time: '1 día',
      read: true,
      icon: 'CheckCircle',
      sentVia: 'Email'
    },
    {
      id: '5',
      title: 'Recordatorio Enviado',
      message: 'Se envió un recordatorio automático 24 horas antes de su cita de Ecografía programada para el 27/10/2025 a las 08:00.',
      type: 'system',
      priority: 'low',
      time: '2 días',
      read: true,
      icon: 'Info',
      sentVia: 'Sistema'
    }
  ];

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, React.ComponentType<any>> = {
      AlertCircle,
      Calendar,
      CheckCircle,
      Info,
      Bell
    };
    return icons[iconName] || Bell;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'medical-orange';
      case 'low':
        return 'medical-blue';
      default:
        return 'secondary';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      case 'low':
        return 'Baja';
      default:
        return priority;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'reminder':
        return 'destructive';
      case 'results':
        return 'default';
      case 'confirmation':
        return 'default';
      case 'cancelled':
        return 'default';
      case 'system':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getTypeBackground = (type: string) => {
    switch (type) {
      case 'reminder':
        return 'bg-red-50 border-red-200';
      case 'confirmation':
        return 'bg-yellow-50 border-yellow-200';
      case 'cancelled':
        return 'bg-yellow-50 border-yellow-200';
      case 'results':
        return 'bg-blue-50 border-blue-200';
      case 'system':
        return 'bg-gray-50 border-gray-200';
      default:
        return '';
    }
  };

  const handleDeleteNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStorage.setItem('medical-app-notifications', JSON.stringify(updated));
    
    toast({
      title: "Notificación eliminada",
      description: "La notificación ha sido eliminada correctamente.",
    });
  };

  const handleMarkAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('medical-app-notifications', JSON.stringify(updated));
    
    toast({
      title: "Notificaciones actualizadas",
      description: "Todas las notificaciones han sido marcadas como leídas.",
    });
  };

  // Combine real notifications with sample ones
  const allNotifications = [...notifications, ...sampleNotifications];
  const unreadCount = allNotifications.filter(n => !n.read).length;

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Notificaciones
        </h1>
        <p className="text-muted-foreground">
          Mantenga al día sus recordatorios y mensajes del sistema.
        </p>
      </header>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificaciones
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuración
          </TabsTrigger>
        </TabsList>

        {/* Tab de Notificaciones */}
        <TabsContent value="notifications" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Tienes {unreadCount} notificaciones sin leer
            </p>
            {unreadCount > 0 && (
              <Button variant="default" size="sm" onClick={handleMarkAllAsRead}>
                Marcar todas como leídas
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {allNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`transition-all duration-200 hover:shadow-md ${getTypeBackground(notification.type)} ${
                  !notification.read ? 'border-l-4 border-l-primary' : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-0.5">
                        {(() => {
                          const IconComponent = getIconComponent(notification.icon);
                          return <IconComponent className="h-5 w-5 text-foreground" />;
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm text-foreground">
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-foreground/80 leading-relaxed">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">
                            {notification.time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <Badge 
                        variant={getTypeColor(notification.type) as any}
                        className="text-xs whitespace-nowrap"
                      >
                        {getPriorityText(notification.priority)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 pb-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      aria-label="Eliminar notificación"
                      onClick={() => handleDeleteNotification(notification.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {allNotifications.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <div className="mx-auto w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
                  <Bell className="h-8 w-8 text-muted-foreground" />
                </div>
                <CardTitle className="mb-2">No hay notificaciones</CardTitle>
                <CardDescription>
                  Cuando reciba nuevas notificaciones, aparecerán aquí.
                </CardDescription>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab de Configuración */}
        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Notificaciones</CardTitle>
              <CardDescription>
                Personalice cómo y cuándo recibir notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Recordatorios por Email */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1">
                  <Label htmlFor="email-reminders" className="text-base font-semibold flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Recordatorios por Email
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Reciba recordatorios de citas y resultados por correo electrónico
                  </p>
                </div>
                <Switch
                  id="email-reminders"
                  checked={emailReminders}
                  onCheckedChange={setEmailReminders}
                />
              </div>
              
              <Separator />

              {/* Recordatorios por SMS */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1">
                  <Label htmlFor="sms-reminders" className="text-base font-semibold flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Recordatorios por SMS
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Reciba mensajes de texto para recordatorios importantes
                  </p>
                </div>
                <Switch
                  id="sms-reminders"
                  checked={smsReminders}
                  onCheckedChange={setSmsReminders}
                />
              </div>

              <Separator />

              {/* Notificaciones del Sistema */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1">
                  <Label htmlFor="system-notifications" className="text-base font-semibold flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notificaciones del Sistema
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Reciba actualizaciones sobre mantenimiento y cambios del sistema
                  </p>
                </div>
                <Switch
                  id="system-notifications"
                  checked={systemNotifications}
                  onCheckedChange={setSystemNotifications}
                />
              </div>

              <Separator />

              {/* Recordatorios de Citas */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1">
                  <Label htmlFor="appointment-reminders" className="text-base font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Recordatorios de Citas
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Reciba recordatorios 24 horas antes de sus citas
                  </p>
                </div>
                <Switch
                  id="appointment-reminders"
                  checked={appointmentReminders}
                  onCheckedChange={setAppointmentReminders}
                />
              </div>

              <Separator />

              {/* Notificaciones de Resultados */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1">
                  <Label htmlFor="result-notifications" className="text-base font-semibold flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Notificaciones de Resultados
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Reciba alertas cuando sus resultados estén disponibles
                  </p>
                </div>
                <Switch
                  id="result-notifications"
                  checked={resultNotifications}
                  onCheckedChange={setResultNotifications}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Notifications;