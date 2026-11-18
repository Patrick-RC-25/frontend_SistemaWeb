/** Evaluación del backend RandomStudyDB */
export interface NotaApi {
  id_evaluacion: number;
  id_curso: number;
  id_tipo_evaluacion: number;
  nombre: string;
  ponderacion: number;
  nota_maxima: number;
  nota_obtenida: number | null;
  fecha_evaluacion: string | null;
}
