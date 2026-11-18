export interface ObjetivoApi {
  id: number;
  titulo: string;
  valor_actual: number;
  valor_meta: number;
  progreso: number;
  descripcion?: string | null;
}
