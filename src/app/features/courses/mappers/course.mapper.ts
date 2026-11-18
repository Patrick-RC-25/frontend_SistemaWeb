import { CursoApi } from '../interfaces/curso-api.interface';
import { Course } from '../interfaces/course.interface';

const CONECTORES = new Set(['de', 'del', 'la', 'las', 'el', 'los', 'y', 'e', 'en']);

export function buildShortName(nombre: string): string {
  const palabras = nombre
    .split(/\s+/)
    .filter((palabra) => palabra.length > 0 && !CONECTORES.has(palabra.toLowerCase()));
  return palabras.slice(0, 2).map((palabra) => palabra[0]?.toUpperCase() ?? '').join('');
}

export function toCourse(curso: CursoApi): Course {
  return {
    id: curso.id_curso,
    name: curso.nombre,
    code: curso.codigo ?? '',
    shortName: buildShortName(curso.nombre),
    credits: curso.creditos ?? 0,
    average: curso.promedio_actual,
    targetAverage: curso.nota_objetivo,
    teacher: curso.docente ?? undefined,
    color: curso.color ?? undefined,
  };
}
