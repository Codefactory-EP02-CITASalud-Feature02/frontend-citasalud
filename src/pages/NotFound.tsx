import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Sistema Médico - Error 404</h1>
        <p className="mb-4 text-xl text-muted-foreground">
          La página que busca no existe.
        </p>
        <button 
          onClick={() => window.location.href = '/dashboard'}
          className="text-primary underline hover:no-underline"
        >
          Volver al Dashboard
        </button>
      </div>
    </div>
  );
};

export default NotFound;
