import { RendimientoApi } from '../interfaces/rendimiento-api.interface';
import { AcademicPerformance } from '../interfaces/performance.interface';

export function toPerformance(rendimiento: RendimientoApi): AcademicPerformance {
  return {
    generalAverage: rendimiento.promedio_general,
    coursesBelowTarget: rendimiento.cursos_bajo_objetivo ?? [],
    recommendations: rendimiento.recomendaciones ?? [],
    courses: rendimiento.cursos.map((curso) => ({
      courseId: curso.id_curso,
      courseName: curso.nombre,
      average: curso.promedio,
      targetAverage: curso.nota_objetivo,
      difference: curso.diferencia,
      progressPercentage: curso.promedio === null
        ? 0
        : Math.min(100, Math.max(0, Math.round((curso.promedio / 20) * 100))),
    })),
  };
}
