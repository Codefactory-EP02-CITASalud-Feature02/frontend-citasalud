import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresScheduling?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiresScheduling = false 
}) => {
  const { isAuthenticated, hasSchedulingAccess, user } = useAuth();

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated but doesn't have scheduling access for scheduling routes
  if (requiresScheduling && !hasSchedulingAccess) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="border-destructive/20">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-2xl text-destructive flex items-center justify-center gap-2">
                <AlertTriangle className="h-6 w-6" />
                Acceso No Autorizado
              </CardTitle>
              <CardDescription className="text-base">
                Su rol actual ({user?.role}) no tiene permisos para acceder al módulo de agendamiento de citas.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Roles autorizados para agendamiento:</strong>
                </p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  <li>• Doctor</li>
                  <li>• Administrador</li>
                  <li>• Enfermero</li>
                </ul>
              </div>
              
              <p className="text-muted-foreground">
                Si necesita acceso a esta funcionalidad, contacte al administrador del sistema.
              </p>
              
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={() => window.history.back()}
                  variant="outline"
                >
                  Volver
                </Button>
                <Button 
                  onClick={() => window.location.href = '/dashboard'}
                >
                  Ir al Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;