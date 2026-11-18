export interface CursoApi {
  id_curso: number;
  id_periodo: number;
  nombre: string;
  codigo: string | null;
  docente: string | null;
  creditos: number | null;
  color: string | null;
  nota_objetivo: number | null;
  estado: boolean;
  promedio_actual: number | null;
}
