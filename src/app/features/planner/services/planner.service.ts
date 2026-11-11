import { Injectable, inject } from '@angular/core';
import { MockDataService } from '../../../core/services/mock-data.service';
import { StudySession, StudySessionStatus } from '../interfaces/study-session.interface';
import { StudySessionForm } from '../interfaces/study-session-form.interface';
import { Course } from '../../courses/interfaces/course.interface';

@Injectable({ providedIn: 'root' })
export class PlannerService {
  private readonly mock = inject(MockDataService);

  /** Lista de sesiones (fuente de datos) */
  mostrar(): StudySession[] {
    return this.mock.sessions()();
  }

  mostrarCursos(): Course[] {
    return this.mock.courses();
  }

  /** Guardar nueva sesión */
  guardar(formulario: StudySessionForm): void {
    const courseId = Number(formulario.courseId);
    const curso = this.mock.courses().find((c) => c.id === courseId);
    this.mock.addSession({
      courseId,
      courseName: curso?.name ?? 'Curso',
      title: formulario.title.trim(),
      description: formulario.description.trim(),
      date: formulario.date,
      startTime: formulario.startTime,
      durationMinutes: +formulario.durationMinutes,
      status: 'pending',
    });
  }

  completar(id: number): void {
    this.mock.updateSession(id, { status: 'completed' });
  }

  cancelar(id: number): void {
    this.mock.updateSession(id, { status: 'cancelled' });
  }

  filtrar(estado: 'all' | StudySessionStatus): StudySession[] {
    const lista = [...this.mostrar()].sort(
      (a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)
    );
    if (estado === 'all') return lista;
    return lista.filter((s) => s.status === estado);
  }
}
