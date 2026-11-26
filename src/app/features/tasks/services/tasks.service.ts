import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TareaApi, TareaWriteApi } from '../interfaces/tarea-api.interface';
import { AcademicTask } from '../interfaces/task.interface';
import { TaskFormModel } from '../interfaces/task-form.interface';
import { toAcademicTask } from '../mappers/task.mapper';

@Injectable({ providedIn: 'root' })
export class TasksService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/tareas`;

  listar(courseNames: Map<number, string> = new Map(), objectiveNames: Map<number, string> = new Map()): Observable<AcademicTask[]> {
    return this.http.get<TareaApi[]>(this.apiUrl).pipe(
      map((items) => items.map((item) => toAcademicTask(
        item,
        item.id_curso === null ? '' : courseNames.get(item.id_curso) ?? 'Curso de otro periodo',
        item.id_objetivo === null ? '' : objectiveNames.get(item.id_objetivo) ?? 'Objetivo académico',
      ))),
    );
  }

  crear(model: TaskFormModel): Observable<TareaApi> {
    return this.http.post<TareaApi>(this.apiUrl, this.toPayload(model, 'pendiente'));
  }

  actualizar(task: AcademicTask, status: AcademicTask['status']): Observable<TareaApi> {
    return this.http.put<TareaApi>(`${this.apiUrl}/${task.id}`, {
      id_curso: task.courseId,
      id_objetivo: task.objectiveId,
      titulo: task.title,
      descripcion: task.description || null,
      fecha_vencimiento: task.dueDate,
      prioridad: task.priority,
      estado: status,
    } satisfies TareaWriteApi);
  }

  editar(id: number, model: TaskFormModel, status: AcademicTask['status']): Observable<TareaApi> {
    return this.http.put<TareaApi>(`${this.apiUrl}/${id}`, this.toPayload(model, status));
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private toPayload(model: TaskFormModel, status: TareaWriteApi['estado']): TareaWriteApi {
    const courseId = model.courseId ? Number(model.courseId) : null;
    const objectiveId = model.objectiveId ? Number(model.objectiveId) : null;
    const dueDate = model.dueDate.trim()
      ? model.dueDate.length === 16 ? `${model.dueDate}:00` : model.dueDate
      : null;
    return {
      id_curso: courseId !== null && Number.isFinite(courseId) ? courseId : null,
      id_objetivo: objectiveId !== null && Number.isFinite(objectiveId) ? objectiveId : null,
      titulo: model.title.trim(),
      descripcion: model.description.trim() || null,
      fecha_vencimiento: dueDate,
      prioridad: model.priority,
      estado: status,
    };
  }
}
