import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AlertaApi } from '../interfaces/alerta-api.interface';
import { AcademicAlert, AlertKind } from '../interfaces/alert.interface';
import { toAlert } from '../mappers/alert.mapper';

export type AlertFilter = 'all' | 'unread' | 'read' | AlertKind;

@Injectable({ providedIn: 'root' })
export class AlertsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/alertas`;
  private readonly alertsSubject = new BehaviorSubject<AcademicAlert[]>([]);

  unreadCount$(): Observable<number> {
    return this.alertsSubject.pipe(map((items) => items.filter((item) => !item.read).length));
  }

  mostrar(): Observable<AcademicAlert[]> {
    return this.http.get<AlertaApi[]>(this.apiUrl).pipe(
      map((alertas) => alertas.map(toAlert)),
      tap((alertas) => this.alertsSubject.next(alertas)),
    );
  }

  filtrar(filtro: AlertFilter, lista: AcademicAlert[]): AcademicAlert[] {
    if (filtro === 'all') return lista;
    if (filtro === 'unread') return lista.filter((alerta) => !alerta.read);
    if (filtro === 'read') return lista.filter((alerta) => alerta.read);
    return lista.filter((alerta) => alerta.kind === filtro);
  }

  crearDetallado(datos: {
    titulo: string;
    mensaje: string;
    id_tipo_alerta: number;
    id_curso: number | null;
    fecha_programada: string | null;
  }): Observable<AcademicAlert> {
    const fecha = datos.fecha_programada
      ? datos.fecha_programada.length === 16
        ? `${datos.fecha_programada}:00`
        : datos.fecha_programada
      : null;

    return this.http.post<AlertaApi>(this.apiUrl, {
      id_curso: datos.id_curso,
      id_tarea: null,
      id_tipo_alerta: datos.id_tipo_alerta,
      titulo: datos.titulo,
      mensaje: datos.mensaje,
      fecha_programada: fecha,
    }).pipe(
      map(toAlert),
      tap((alerta) => this.alertsSubject.next([alerta, ...this.alertsSubject.value])),
    );
  }

  marcarLeida(id: number): Observable<AcademicAlert> {
    return this.http.patch<AlertaApi>(`${this.apiUrl}/${id}/leida`, {}).pipe(
      map(toAlert),
      tap((actualizada) => this.alertsSubject.next(
        this.alertsSubject.value.map((alerta) => alerta.id === id ? actualizada : alerta),
      )),
    );
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.alertsSubject.next(this.alertsSubject.value.filter((alerta) => alerta.id !== id))),
    );
  }
}
