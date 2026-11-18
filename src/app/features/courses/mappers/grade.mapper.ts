import { NotaApi } from '../interfaces/nota-api.interface';
import { Grade } from '../interfaces/grade.interface';

const TIPOS: Record<number, { type: string; label: string }> = {
  1: { type: 'exam', label: 'Examen' },
  2: { type: 'exam', label: 'Parcial' },
  3: { type: 'practice', label: 'Práctica' },
  4: { type: 'assignment', label: 'Trabajo' },
  5: { type: 'project', label: 'Proyecto' },
  6: { type: 'other', label: 'Otros' },
};

export function toGrade(nota: NotaApi): Grade {
  const tipo = TIPOS[nota.id_tipo_evaluacion] ?? TIPOS[6];
  return {
    id: nota.id_evaluacion,
    courseId: nota.id_curso,
    name: nota.nombre,
    score: nota.nota_obtenida,
    maxScore: nota.nota_maxima,
    weight: nota.ponderacion,
    date: nota.fecha_evaluacion ?? '',
    type: tipo.type,
    typeId: nota.id_tipo_evaluacion,
    typeLabel: tipo.label,
  };
}
