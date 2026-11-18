import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CursoApi } from '../interfaces/curso-api.interface';
import { NotaApi } from '../interfaces/nota-api.interface';
import { Course } from '../interfaces/course.interface';
import { Grade } from '../interfaces/grade.interface';
import { toCourse } from '../mappers/course.mapper';
import { toGrade } from '../mappers/grade.mapper';

export interface PeriodoApi {
  id_periodo: number;
  id_usuario: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: 'activo' | 'finalizado' | 'planificado';
}

@Injectable({ providedIn: 'root' })
export class CoursesService {
  private readonly http = inject(HttpClient);
  private readonly cursosUrl = `${environment.apiUrl}/cursos`;
  private readonly evaluacionesUrl = `${environment.apiUrl}/evaluaciones`;
  private readonly periodosUrl = `${environment.apiUrl}/periodos`;

  getCourses(): Observable<Course[]> {
    return this.http.get<CursoApi[]>(this.cursosUrl).pipe(map((cursos) => cursos.map(toCourse)));
  }

  getPeriodos(): Observable<PeriodoApi[]> {
    return this.http.get<PeriodoApi[]>(this.periodosUrl);
  }

  crearPeriodo(datos: { nombre: string; fecha_inicio: string; fecha_fin: string }): Observable<PeriodoApi> {
    return this.http.post<PeriodoApi>(this.periodosUrl, { ...datos, estado: 'activo' });
  }

  getPeriodoActivoId(): Observable<number | null> {
    return this.http.get<PeriodoApi[]>(this.periodosUrl).pipe(
      map((lista) => {
        const activo = lista.find((p) => p.estado === 'activo');
        return activo ? activo.id_periodo : null;
      }),
    );
  }

  crearCurso(datos: {
    nombre: string;
    codigo?: string;
    docente?: string;
    creditos?: number;
    nota_objetivo?: number;
    color?: string;
  }): Observable<Course> {
    return this.getPeriodoActivoId().pipe(
      switchMap((idPeriodo) => {
        if (idPeriodo == null) {
          throw new Error('No hay un periodo académico activo. Crea un periodo antes de registrar cursos.');
        }
        const body = {
          id_periodo: idPeriodo,
          nombre: datos.nombre,
          codigo: datos.codigo || null,
          docente: datos.docente || null,
          creditos: datos.creditos ?? 3,
          color: datos.color || null,
          nota_objetivo: datos.nota_objetivo ?? 14,
        };
        return this.http.post<CursoApi>(this.cursosUrl, body).pipe(map(toCourse));
      }),
    );
  }

  actualizarCurso(id: number, datos: {
    nombre: string;
    codigo?: string;
    docente?: string;
    creditos?: number;
    nota_objetivo?: number;
    color?: string;
  }): Observable<Course> {
    return this.http.put<CursoApi>(`${this.cursosUrl}/${id}`, {
      nombre: datos.nombre,
      codigo: datos.codigo || null,
      docente: datos.docente || null,
      creditos: datos.creditos ?? null,
      color: datos.color || null,
      nota_objetivo: datos.nota_objetivo ?? null,
      estado: true,
    }).pipe(map(toCourse));
  }

  eliminarCurso(id: number): Observable<void> {
    return this.http.delete<void>(`${this.cursosUrl}/${id}`);
  }

  getGrades(): Observable<Grade[]> {
    return this.getCourses().pipe(
      switchMap((courses) => {
        if (courses.length === 0) {
          return of([]);
        }
        const requests = courses.map((c) =>
          this.http
            .get<NotaApi[]>(`${this.evaluacionesUrl}/curso/${c.id}`)
            .pipe(map((notas) => notas.map(toGrade))),
        );
        return forkJoin(requests).pipe(map((grupos) => grupos.flat()));
      }),
    );
  }

  getGradesByCourse(courseId: number): Observable<Grade[]> {
    return this.http
      .get<NotaApi[]>(`${this.evaluacionesUrl}/curso/${courseId}`)
      .pipe(map((notas) => notas.map(toGrade)));
  }

  crearEvaluacion(datos: {
    id_curso: number;
    id_tipo_evaluacion: number;
    nombre: string;
    ponderacion: number;
    nota_maxima: number;
    nota_obtenida: number | null;
    fecha_evaluacion: string | null;
  }): Observable<Grade> {
    const body = {
      id_curso: datos.id_curso,
      id_tipo_evaluacion: datos.id_tipo_evaluacion,
      nombre: datos.nombre,
      ponderacion: datos.ponderacion,
      nota_maxima: datos.nota_maxima,
      nota_obtenida: datos.nota_obtenida,
      fecha_evaluacion: datos.fecha_evaluacion,
    };
    return this.http.post<NotaApi>(this.evaluacionesUrl, body).pipe(map(toGrade));
  }
  actualizarEvaluacion(id: number, datos: {
    id_curso: number;
    id_tipo_evaluacion: number;
    nombre: string;
    ponderacion: number;
    nota_maxima: number;
    nota_obtenida: number | null;
    fecha_evaluacion: string | null;
  }): Observable<Grade> {
    return this.http.put<NotaApi>(`${this.evaluacionesUrl}/${id}`, datos).pipe(map(toGrade));
  }

  eliminarEvaluacion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.evaluacionesUrl}/${id}`);
  }

}
