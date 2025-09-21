import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  Info,
  Trash2
} from 'lucide-react';

const Notifications: React.FC = () => {
  const notifications = [
    {
      id: '1',
      title: 'Recordatorio de Cita',
      message: 'Su cita de Radiografía de Tórax con Dr. Ana Martínez está programada para mañana a las 10:00 AM.',
      type: 'reminder',
      priority: 'high',
      time: '2 horas',
      read: false,
      icon: Calendar
    },
    {
      id: '2',
      title: 'Resultados Disponibles',
      message: 'Los resultados de su examen de sangre ya están disponibles para descarga.',
      type: 'results',
      priority: 'medium',
      time: '1 día',
      read: false,
      icon: CheckCircle
    },
    {
      id: '3',
      title: 'Cita Reprogramada',
      message: 'Su cita del 25 de enero ha sido reprogramada para el 28 de enero a la misma hora.',
      type: 'update',
      priority: 'high',
      time: '2 días',
      read: true,
      icon: AlertCircle
    },
    {
      id: '4',
      title: 'Recordatorio de Medicamento',
      message: 'No olvide tomar su medicamento para la presión arterial hoy a las 8:00 AM.',
      type: 'medication',
      priority: 'medium',
      time: '3 días',
      read: true,
      icon: Info
    },
    {
      id: '5',
      title: 'Confirmación de Cita',
      message: 'Su cita de Control Cardiológico ha sido confirmada para el 25 de enero a las 2:30 PM.',
      type: 'confirmation',
      priority: 'low',
      time: '5 días',
      read: true,
      icon: CheckCircle
    }
  ];

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
        return 'medical-orange';
      case 'results':
        return 'medical-green';
      case 'update':
        return 'medical-blue';
      case 'medication':
        return 'medical-purple';
      case 'confirmation':
        return 'medical-green';
      default:
        return 'secondary';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="p-6">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Notificaciones
            </h1>
            <p className="text-muted-foreground">
              Mantenga un seguimiento de sus mensajes y recordatorios médicos.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-sm">
                {unreadCount} nuevas
              </Badge>
            )}
            <Button variant="outline" size="sm">
              Marcar todas como leídas
            </Button>
          </div>
        </div>
      </header>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card 
            key={notification.id} 
            className={`transition-all duration-200 hover:shadow-md ${
              !notification.read ? 'border-l-4 border-l-primary bg-primary/5' : ''
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg bg-${getTypeColor(notification.type)}/10 flex items-center justify-center`}>
                    <notification.icon className={`h-5 w-5 text-${getTypeColor(notification.type)}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-base">
                        {notification.title}
                      </CardTitle>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                    <CardDescription className="text-sm leading-relaxed">
                      {notification.message}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Badge 
                    variant="outline"
                    className={`text-xs bg-${getPriorityColor(notification.priority)}/10 text-${getPriorityColor(notification.priority)} border-${getPriorityColor(notification.priority)}/20`}
                  >
                    {getPriorityText(notification.priority)}
                  </Badge>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    Hace {notification.time}
                  </span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {notification.read ? 'Marcar como no leída' : 'Marcar como leída'}
                  </Button>
                  {notification.type === 'results' && (
                    <Button variant="ghost" size="sm" className="h-8 text-xs">
                      Ver resultados
                    </Button>
                  )}
                  {notification.type === 'reminder' && (
                    <Button variant="ghost" size="sm" className="h-8 text-xs">
                      Ver cita
                    </Button>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Eliminar notificación</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {notifications.length === 0 && (
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
    </div>
  );
};

export default Notifications;