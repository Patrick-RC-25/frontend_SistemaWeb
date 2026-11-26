export interface TareaApi {
  id_tarea: number;
  id_usuario: number;
  id_curso: number | null;
  id_objetivo: number | null;
  titulo: string;
  descripcion: string | null;
  fecha_vencimiento: string | null;
  prioridad: 'baja' | 'media' | 'alta';
  estado: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';
  fecha_completada: string | null;
}

export interface TareaWriteApi {
  id_curso: number | null;
  id_objetivo: number | null;
  titulo: string;
  descripcion: string | null;
  fecha_vencimiento: string | null;
  prioridad: 'baja' | 'media' | 'alta';
  estado: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';
}
