import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SesionApi } from '../interfaces/sesion-api.interface';
import { StudySession, StudySessionStatus } from '../interfaces/study-session.interface';
import { StudySessionForm } from '../interfaces/study-session-form.interface';
import { toStudySession } from '../mappers/session.mapper';

function toLocalIso(date: string, time: string, addMinutes = 0): string {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  const dt = new Date(y, m - 1, d, hh, mm, 0);
  dt.setMinutes(dt.getMinutes() + addMinutes);
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}` +
    `T${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`
  );
}

@Injectable({ providedIn: 'root' })
export class PlannerService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/sesiones`;

  mostrar(): Observable<StudySession[]> {
    return this.http
      .get<SesionApi[]>(this.apiUrl)
      .pipe(map((lista) => lista.map((sesion) => toStudySession(sesion))));
  }

  guardar(formulario: StudySessionForm): Observable<StudySession> {
    const inicio = toLocalIso(formulario.date, formulario.startTime);
    const fin = toLocalIso(formulario.date, formulario.startTime, formulario.durationMinutes);
    const courseId = formulario.courseId ? Number(formulario.courseId) : null;
    const body = {
      id_curso: courseId && !Number.isNaN(courseId) ? courseId : null,
      id_tarea: null,
      titulo: formulario.title,
      fecha_inicio_programada: inicio,
      fecha_fin_programada: fin,
      notas: formulario.description || null,
    };
    return this.http.post<SesionApi>(this.apiUrl, body).pipe(map((sesion) => toStudySession(sesion)));
  }

  iniciar(id: number): Observable<StudySession> {
    return this.http
      .patch<SesionApi>(`${this.apiUrl}/${id}/iniciar`, {})
      .pipe(map((sesion) => toStudySession(sesion)));
  }

  finalizar(id: number): Observable<StudySession> {
    return this.http
      .patch<SesionApi>(`${this.apiUrl}/${id}/finalizar`, {})
      .pipe(map((sesion) => toStudySession(sesion)));
  }

  cancelar(id: number): Observable<StudySession> {
    return this.http
      .patch<SesionApi>(`${this.apiUrl}/${id}/cancelar`, {})
      .pipe(map((sesion) => toStudySession(sesion)));
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  filtrar(estado: 'all' | StudySessionStatus, lista: StudySession[]): StudySession[] {
    const ordenada = [...lista].sort(
      (a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime),
    );
    if (estado === 'all') return ordenada;
    return ordenada.filter((sesion) => sesion.status === estado);
  }
}
