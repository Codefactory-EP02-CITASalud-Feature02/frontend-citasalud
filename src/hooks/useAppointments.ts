import { useState, useEffect } from 'react';

export interface Appointment {
  id: string;
  patientName: string;
  examType: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  createdAt: string;
}

const STORAGE_KEY = 'medical-app-appointments';

// Citas de ejemplo que coinciden con las del historial
const SAMPLE_APPOINTMENTS: Appointment[] = [
  {
    id: 'sample-1',
    patientName: 'María García',
    examType: 'Ecografía Abdominal',
    date: '2025-10-28',
    startTime: '09:00',
    endTime: '10:00',
    location: 'Sede Norte',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sample-2',
    patientName: 'Carlos Rodríguez',
    examType: 'Consulta Cardiológica',
    date: '2025-10-28',
    startTime: '14:00',
    endTime: '15:00',
    location: 'Sede Centro',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sample-3',
    patientName: 'Ana Martínez',
    examType: 'Radiografía de Tórax',
    date: '2025-10-29',
    startTime: '10:00',
    endTime: '11:00',
    location: 'Sede Norte',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sample-4',
    patientName: 'Pedro López',
    examType: 'Exámenes de Laboratorio',
    date: '2025-10-30',
    startTime: '11:00',
    endTime: '12:00',
    location: 'Sede Sur',
    createdAt: new Date().toISOString()
  },
];

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Cargar citas desde localStorage al iniciar
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAppointments(parsed);
      } catch (error) {
        console.error('Error loading appointments:', error);
        // Si hay error, cargar las de ejemplo
        setAppointments(SAMPLE_APPOINTMENTS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_APPOINTMENTS));
      }
    } else {
      // Primera vez: cargar citas de ejemplo
      setAppointments(SAMPLE_APPOINTMENTS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_APPOINTMENTS));
    }
  }, []);

  // Guardar en localStorage cuando cambien las citas
  useEffect(() => {
    if (appointments.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
    }
  }, [appointments]);

  const addAppointment = (appointment: Omit<Appointment, 'id' | 'createdAt'>): Appointment => {
    const newAppointment: Appointment = {
      ...appointment,
      id: `apt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    setAppointments(prev => [...prev, newAppointment]);
    return newAppointment;
  };

  const removeAppointment = (appointmentId: string): void => {
    setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
  };

  const getAppointmentsForDate = (date: string): Appointment[] => {
    return appointments.filter(apt => apt.date === date);
  };

  const getAppointmentsForDateRange = (startDate: string, endDate: string): Appointment[] => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= start && aptDate <= end;
    });
  };

  const clearAllAppointments = (): void => {
    setAppointments([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    appointments,
    addAppointment,
    removeAppointment,
    getAppointmentsForDate,
    getAppointmentsForDateRange,
    clearAllAppointments,
  };
}
