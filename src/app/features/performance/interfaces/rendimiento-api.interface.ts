export interface RendimientoApi {
  promedio_general: number | null;
  cursos: Array<{
    id_curso: number;
    nombre: string;
    promedio: number | null;
    nota_objetivo: number | null;
    diferencia: number | null;
  }>;
  cursos_bajo_objetivo: string[];
  recomendaciones: string[];
}
