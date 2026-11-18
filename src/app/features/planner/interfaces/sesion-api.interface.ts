export interface SesionApi {
  id_sesion: number;
  id_usuario: number;
  id_curso: number | null;
  id_tarea: number | null;
  titulo: string;
  fecha_inicio_programada: string;
  fecha_fin_programada: string;
  fecha_inicio_real: string | null;
  fecha_fin_real: string | null;
  estado: string;
  notas: string | null;
}
