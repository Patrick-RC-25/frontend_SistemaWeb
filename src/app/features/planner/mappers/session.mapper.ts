import { SesionApi } from '../interfaces/sesion-api.interface';
import { StudySession, StudySessionStatus } from '../interfaces/study-session.interface';

function mapEstado(estado: string): StudySessionStatus {
  switch (estado) {
    case 'en_progreso': return 'inProgress';
    case 'completada': return 'completed';
    case 'cancelada': return 'cancelled';
    default: return 'pending';
  }
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function toStudySession(sesion: SesionApi, courseName = ''): StudySession {
  const inicio = new Date(sesion.fecha_inicio_programada);
  const fin = new Date(sesion.fecha_fin_programada);
  const durationMinutes = Math.max(0, Math.round((fin.getTime() - inicio.getTime()) / 60000));
  const date = `${inicio.getFullYear()}-${pad(inicio.getMonth() + 1)}-${pad(inicio.getDate())}`;
  const startTime = `${pad(inicio.getHours())}:${pad(inicio.getMinutes())}`;

  return {
    id: sesion.id_sesion,
    courseId: sesion.id_curso,
    courseName,
    title: sesion.titulo,
    description: sesion.notas ?? '',
    date,
    startTime,
    durationMinutes,
    status: mapEstado(sesion.estado),
  };
}
