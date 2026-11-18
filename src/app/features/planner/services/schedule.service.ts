import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HorarioApi, HorarioCreateApi } from '../interfaces/horario-api.interface';
import { CourseSchedule, ScheduleFormModel } from '../interfaces/course-schedule.interface';

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/horarios`;

  listar(courseNames: Map<number, string>): Observable<CourseSchedule[]> {
    return this.http.get<HorarioApi[]>(this.apiUrl).pipe(map((items) => items.map((item) => ({
      id: item.id_horario,
      courseId: item.id_curso,
      courseName: courseNames.get(item.id_curso) ?? 'Curso',
      day: item.dia_semana,
      startTime: item.hora_inicio.slice(0, 5),
      endTime: item.hora_fin.slice(0, 5),
      classroom: item.aula ?? '',
    }))));
  }

  crear(model: ScheduleFormModel): Observable<HorarioApi> {
    const courseId = Number(model.courseId);
    const body: HorarioCreateApi = {
      id_curso: courseId,
      dia_semana: Number(model.day),
      hora_inicio: model.startTime,
      hora_fin: model.endTime,
      aula: model.classroom.trim() || null,
    };
    return this.http.post<HorarioApi>(this.apiUrl, body);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
