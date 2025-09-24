import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Calendar, 
  FileText, 
  Bell, 
  User,
  CalendarDays,
  Activity,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, hasSchedulingAccess } = useAuth();
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Agendar Cita',
      description: 'Programe una nueva cita médica',
      icon: Calendar,
      colorClass: 'text-medical-blue',
      bgClass: 'bg-medical-blue/10',
      href: '/dashboard/schedule',
      requiresScheduling: true
    },
    {
      title: 'Ver Historial',
      description: 'Consulte sus citas anteriores',
      icon: FileText,
      colorClass: 'text-medical-green',
      bgClass: 'bg-medical-green/10',
      href: '/dashboard/history'
    },
    {
      title: 'Notificaciones',
      description: 'Revise sus mensajes y recordatorios',
      icon: Bell,
      colorClass: 'text-medical-orange',
      bgClass: 'bg-medical-orange/10',
      href: '/dashboard/notifications'
    },
    {
      title: 'Mi Perfil',
      description: 'Actualice su información personal',
      icon: User,
      colorClass: 'text-medical-purple',
      bgClass: 'bg-medical-purple/10',
      href: '/dashboard/profile'
    }
  ];

  const upcomingAppointments = [
    {
      id: '1',
      title: 'Radiografía de Tórax',
      doctor: 'Dr. Ana Martínez',
      date: '2024-01-20',
      time: '10:00 AM',
      location: 'Sede Norte'
    },
    {
      id: '2',
      title: 'Control Cardiológico',
      doctor: 'Dr. Carlos López',
      date: '2024-01-25',
      time: '2:30 PM',
      location: 'Sede Centro'
    }
  ];

  const recentActivity = [
    {
      id: '1',
      type: 'completed',
      title: 'Consulta General - Dr. López',
      date: '2024-01-15',
      icon: CheckCircle,
      colorClass: 'text-medical-green'
    },
    {
      id: '2',
      type: 'completed',
      title: 'Examen de Sangre - Lab Central',
      date: '2024-01-10',
      icon: CheckCircle,
      colorClass: 'text-medical-green'
    },
    {
      id: '3',
      type: 'upcoming',
      title: 'Próxima cita en 3 días',
      date: '2024-01-20',
      icon: Clock,
      colorClass: 'text-medical-orange'
    }
  ];

  const handleQuickAction = (href: string, requiresScheduling?: boolean) => {
    if (requiresScheduling && !hasSchedulingAccess) {
      // This will be handled by the routing
      return;
    }
    navigate(href);
  };

  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Bienvenido, {user?.name}
        </h1>
        <p className="text-muted-foreground">
          Gestione sus citas médicas y mantenga al día su información de salud.
        </p>
      </header>

      {/* Quick Actions Grid */}
      <section className="mb-8" aria-labelledby="quick-actions-title">
        <h2 id="quick-actions-title" className="sr-only">Acciones rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => {
            if (action.requiresScheduling && !hasSchedulingAccess) {
              return null;
            }

            return (
              <Card 
                key={action.title}
                className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                onClick={() => handleQuickAction(action.href, action.requiresScheduling)}
              >
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 rounded-lg ${action.bgClass} flex items-center justify-center mb-3`}>
                    <action.icon className={`h-6 w-6 ${action.colorClass}`} />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    Acceder
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <section aria-labelledby="upcoming-appointments-title">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Próximas Citas
              </CardTitle>
              <CardDescription>
                Sus citas médicas programadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div 
                    key={appointment.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50"
                  >
                    <Calendar className="h-5 w-5 text-medical-blue mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground">
                        {appointment.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {appointment.doctor}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.date} • {appointment.time} • {appointment.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Recent Activity */}
        <section aria-labelledby="recent-activity-title">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Actividad Reciente
              </CardTitle>
              <CardDescription>
                Historial de sus últimas actividades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div 
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50"
                  >
                    <activity.icon className={`h-5 w-5 ${activity.colorClass} mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground">
                        {activity.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {activity.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;