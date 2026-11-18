import { AlertaApi } from '../interfaces/alerta-api.interface';
import { AcademicAlert, AlertKind } from '../interfaces/alert.interface';

function kindFromTipo(id: number): AlertKind {
  switch (id) {
    case 1: return 'reminder';
    case 2: return 'task';
    case 3: return 'review';
    default: return 'system';
  }
}

const LABELS: Record<AlertKind, string> = {
  reminder: 'Recordatorio',
  task: 'Vencimiento',
  review: 'Rendimiento',
  system: 'Sistema',
};

const ACCIONES: Record<AlertKind, string> = {
  reminder: 'Ver planificación',
  task: 'Ver tareas',
  review: 'Ver rendimiento',
  system: 'Ver inicio',
};

export function toAlert(alerta: AlertaApi): AcademicAlert {
  const kind = kindFromTipo(alerta.id_tipo_alerta);
  const date = alerta.fecha_programada
    ? new Date(alerta.fecha_programada).toLocaleString('es-PE', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '';

  return {
    id: alerta.id_alerta,
    kind,
    kindLabel: LABELS[kind],
    title: alerta.titulo,
    courseName: '',
    date,
    detail: alerta.mensaje,
    actionLabel: ACCIONES[kind],
    read: alerta.leida,
  };
}
