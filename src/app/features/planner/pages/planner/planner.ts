import { Component, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin } from 'rxjs';
import { form, FormField, required, minLength, min, max } from '@angular/forms/signals';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';
import { PlannerService } from '../../services/planner.service';
import { CoursesService } from '../../../courses/services/courses.service';
import { StudySession, StudySessionStatus } from '../../interfaces/study-session.interface';
import { StudySessionForm } from '../../interfaces/study-session-form.interface';
import { Course } from '../../../courses/interfaces/course.interface';
import { getApiErrorMessage } from '../../../../core/api/api-error';
import { ScheduleService } from '../../services/schedule.service';
import { CourseSchedule, ScheduleFormModel } from '../../interfaces/course-schedule.interface';

function getLocalDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

@Component({
  selector: 'app-planner',
  standalone: true,
  imports: [PageHeader, EmptyState, LoadingSpinner, FormField],
  templateUrl: './planner.html',
  styleUrl: './planner.css',
})
export class Planner {
  private readonly plannerService = inject(PlannerService);
  private readonly coursesService = inject(CoursesService);
  private readonly scheduleService = inject(ScheduleService);
  private readonly destroyRef = inject(DestroyRef);

  readonly showForm = signal(false);
  readonly filter = signal<'all' | StudySessionStatus>('all');
  readonly sessionFilters: Array<{ id: 'all' | StudySessionStatus; label: string }> = [
    { id: 'all', label: 'Todas' },
    { id: 'pending', label: 'Pendientes' },
    { id: 'inProgress', label: 'En progreso' },
    { id: 'completed', label: 'Completadas' },
    { id: 'cancelled', label: 'Canceladas' },
  ];
  readonly sessions = signal<StudySession[]>([]);
  readonly cursos = signal<Course[]>([]);
  readonly schedules = signal<CourseSchedule[]>([]);
  readonly showScheduleForm = signal(false);
  readonly savingSchedule = signal(false);
  readonly savingSession = signal(false);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  /** Lista que se pinta en la vista */
  readonly listaSesiones = computed(() =>
    this.plannerService.filtrar(this.filter(), this.sessions()),
  );

  /** 2. Modelo signal */
  private readonly sesionModelo = signal<StudySessionForm>({
    courseId: '',
    title: '',
    description: '',
    date: getLocalDateString(),
    startTime: '09:00',
    durationMinutes: 60,
  });

  /** 3. Formulario Signal */
  readonly sesionFormulario = form(this.sesionModelo, (esquema) => {
    required(esquema.title, { message: 'El título es obligatorio' });
    minLength(esquema.title, 3, { message: 'Mínimo 3 caracteres' });
    required(esquema.date, { message: 'La fecha es obligatoria' });
    required(esquema.startTime, { message: 'La hora es obligatoria' });
    required(esquema.durationMinutes, { message: 'La duración es obligatoria' });
    min(esquema.durationMinutes, 15, { message: 'Mínimo 15 minutos' });
    max(esquema.durationMinutes, 240, { message: 'Máximo 240 minutos' });
  });

  private readonly horarioModelo = signal<ScheduleFormModel>({
    courseId: '', day: '1', startTime: '08:00', endTime: '10:00', classroom: '',
  });

  readonly horarioFormulario = form(this.horarioModelo, (schema) => {
    required(schema.courseId, { message: 'Selecciona un curso' });
    required(schema.startTime, { message: 'Indica la hora de inicio' });
    required(schema.endTime, { message: 'Indica la hora de finalización' });
  });

  readonly diasSemana = [
    { id: '1', nombre: 'Lunes' }, { id: '2', nombre: 'Martes' },
    { id: '3', nombre: 'Miércoles' }, { id: '4', nombre: 'Jueves' },
    { id: '5', nombre: 'Viernes' }, { id: '6', nombre: 'Sábado' },
    { id: '7', nombre: 'Domingo' },
  ];

  constructor() {
    forkJoin({
      sessions: this.plannerService.mostrar(),
      courses: this.coursesService.getCourses(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ sessions, courses }) => {
          this.cursos.set(courses);
          const courseNames = new Map<number, string>(courses.map((course) => [course.id, course.name]));
          this.sessions.set(sessions.map((session) => ({
            ...session,
            courseName: session.courseId === null ? '' : courseNames.get(session.courseId) ?? 'Curso de otro periodo',
          })));
          this.sesionModelo.update((modelo) => ({
            ...modelo,
            courseId: modelo.courseId || String(courses[0]?.id ?? ''),
          }));
          this.horarioModelo.update((modelo) => ({
            ...modelo,
            courseId: modelo.courseId || String(courses[0]?.id ?? ''),
          }));
          this.scheduleService.listar(courseNames).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (items) => this.schedules.set(items),
            error: (error: unknown) => this.error.set(getApiErrorMessage(error)),
          });
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.error.set(getApiErrorMessage(error));
          this.loading.set(false);
        },
      });
  }

  setSessionFilter(value: 'all' | StudySessionStatus): void {
    this.filter.set(value);
  }

  openForm() {
    this.sesionModelo.set({
      courseId: String(this.cursos()[0]?.id ?? ''),
      title: '',
      description: '',
      date: getLocalDateString(),
      startTime: '09:00',
      durationMinutes: 60,
    });
    this.showForm.set(true);
  }

  cancelForm() {
    this.showForm.set(false);
  }

  /** Guardar (preventDefault + servicio) */
  guardar(evento: Event) {
    evento.preventDefault();

    if (this.sesionFormulario().invalid()) {
      this.sesionFormulario.title().markAsTouched();
      this.sesionFormulario.date().markAsTouched();
      this.sesionFormulario.startTime().markAsTouched();
      this.sesionFormulario.durationMinutes().markAsTouched();
      return;
    }

    const datos: StudySessionForm = { ...this.sesionModelo() };

    this.savingSession.set(true);
    this.error.set(null);
    this.plannerService
      .guardar(datos)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.savingSession.set(false)),
      )
      .subscribe({
        next: (session) => {
          const courseName = this.cursos().find((course) => course.id === session.courseId)?.name ?? (session.courseId === null ? '' : 'Curso de otro periodo');
          this.sessions.update((list) => [...list, { ...session, courseName }]);
          this.limpiar();
          this.showForm.set(false);
          this.toast('Sesión agregada al plan de estudio.');
        },
        error: (error: unknown) => this.error.set(getApiErrorMessage(error)),
      });
  }

  limpiar() {
    this.sesionModelo.set({
      courseId: String(this.cursos()[0]?.id ?? ''),
      title: '',
      description: '',
      date: getLocalDateString(),
      startTime: '09:00',
      durationMinutes: 60,
    });
  }


  openScheduleForm(): void {
    this.horarioModelo.set({
      courseId: String(this.cursos()[0]?.id ?? ''),
      day: '1', startTime: '08:00', endTime: '10:00', classroom: '',
    });
    this.showScheduleForm.set(true);
  }

  guardarHorario(event: Event): void {
    event.preventDefault();
    if (this.horarioFormulario().invalid()) {
      this.horarioFormulario.courseId().markAsTouched();
      this.horarioFormulario.startTime().markAsTouched();
      this.horarioFormulario.endTime().markAsTouched();
      return;
    }
    const model = this.horarioModelo();
    if (model.endTime <= model.startTime) {
      this.error.set('La hora de finalización debe ser posterior a la hora de inicio.');
      return;
    }
    this.savingSchedule.set(true);
    this.error.set(null);
    this.scheduleService.crear(model).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.savingSchedule.set(false)),
    ).subscribe({
      next: (created) => {
        const course = this.cursos().find((item) => item.id === created.id_curso);
        this.schedules.update((items) => [...items, {
          id: created.id_horario,
          courseId: created.id_curso,
          courseName: course?.name ?? '',
          day: created.dia_semana,
          startTime: created.hora_inicio.slice(0, 5),
          endTime: created.hora_fin.slice(0, 5),
          classroom: created.aula ?? '',
        }].sort((a, b) => a.day - b.day || a.startTime.localeCompare(b.startTime)));
        this.showScheduleForm.set(false);
      },
      error: (error: unknown) => this.error.set(getApiErrorMessage(error)),
    });
  }

  eliminarHorario(id: number): void {
    if (!confirm('¿Eliminar este horario?')) return;
    this.scheduleService.eliminar(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.schedules.update((items) => items.filter((item) => item.id !== id)),
      error: (error: unknown) => this.error.set(getApiErrorMessage(error)),
    });
  }

  nombreDia(day: number): string {
    return this.diasSemana.find((item) => Number(item.id) === day)?.nombre ?? 'Día';
  }

  start(session: StudySession) {
    this.plannerService.iniciar(session.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (updated) => this.updateSession(updated),
      error: (error: unknown) => this.error.set(getApiErrorMessage(error)),
    });
  }

  private updateSession(updated: StudySession): void {
    this.sessions.update((list) => list.map((item) => item.id === updated.id ? {
      ...updated,
      courseName: this.cursos().find((course) => course.id === updated.courseId)?.name ?? (updated.courseId === null ? '' : 'Curso de otro periodo'),
    } : item));
  }

  complete(session: StudySession) {
    this.plannerService
      .finalizar(session.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated: StudySession) => {
          this.updateSession(updated);
          this.toast('Sesión marcada como completada.');
        },
        error: (error: unknown) => this.error.set(getApiErrorMessage(error)),
      });
  }

  cancel(session: StudySession) {
    this.plannerService
      .cancelar(session.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated: StudySession) => this.updateSession(updated),
        error: (error: unknown) => this.error.set(getApiErrorMessage(error)),
      });
  }

  statusLabel(s: StudySessionStatus): string {
    switch (s) {
      case 'inProgress':
        return 'En progreso';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Pendiente';
    }
  }

  private toast(msg: string) {
    try {
      import('sweetalert2').then((m) => {
        m.default.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: msg,
          showConfirmButton: false,
          timer: 2200,
        });
      });
    } catch {
      console.log(msg);
    }
  }
}
