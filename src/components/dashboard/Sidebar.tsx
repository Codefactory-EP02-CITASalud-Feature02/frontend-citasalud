import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Calendar, 
  History, 
  Bell, 
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Agendar Citas', href: '/dashboard/schedule', icon: Calendar, requiresScheduling: true },
  { name: 'Historial', href: '/dashboard/history', icon: History },
  { name: 'Notificaciones', href: '/dashboard/notifications', icon: Bell },
  { name: 'Perfil', href: '/dashboard/profile', icon: User },
];

const Sidebar: React.FC = () => {
  const { logout, hasSchedulingAccess } = useAuth();

  return (
    <div className="w-64 bg-secondary min-h-screen flex flex-col border-r border-border">
      <div className="p-6 border-b border-border">
        <h1 className="text-lg font-semibold text-medical-blue">Sistema Médico</h1>
      </div>
      
      <nav className="flex-1 px-4 py-6" role="navigation" aria-label="Menú principal">
        <ul className="space-y-2">
          {navigation.map((item) => {
            // Skip scheduling link if user doesn't have access
            if (item.requiresScheduling && !hasSchedulingAccess) {
              return null;
            }

            return (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                      'hover:bg-secondary/80',
                      isActive 
                        ? 'bg-primary text-primary-foreground'
                        : 'text-secondary-foreground'
                    )
                  }
                >
                  <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
                  {item.name}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-border">
        <Button
          onClick={logout}
          variant="outline"
          className="w-full justify-start"
          aria-label="Cerrar sesión"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;