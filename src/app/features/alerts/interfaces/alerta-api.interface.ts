export interface AlertaApi {
  id_alerta: number;
  id_usuario: number;
  id_curso: number | null;
  id_tarea: number | null;
  id_tipo_alerta: number;
  titulo: string;
  mensaje: string;
  fecha_programada: string | null;
  leida: boolean;
}
