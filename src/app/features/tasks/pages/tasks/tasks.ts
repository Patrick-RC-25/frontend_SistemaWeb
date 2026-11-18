import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, map, switchMap } from 'rxjs';
import { form, FormField, minLength, required } from '@angular/forms/signals';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';
import { CoursesService } from '../../../courses/services/courses.service';
import { Course } from '../../../courses/interfaces/course.interface';
import { AcademicTask, TaskStatus } from '../../interfaces/task.interface';
import { TaskFormModel } from '../../interfaces/task-form.interface';
import { TasksService } from '../../services/tasks.service';
import { toAcademicTask } from '../../mappers/task.mapper';
import { TareaApi } from '../../interfaces/tarea-api.interface';
import { getApiErrorMessage } from '../../../../core/api/api-error';

function localDateTime(): string {
  const date = new Date();
  date.setMinutes(date.getMinutes() + 60);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

type TaskFilter = 'all' | 'pendiente' | 'en_progreso' | 'completada' | 'atrasada';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [PageHeader, EmptyState, LoadingSpinner, FormField, DatePipe],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css',
})
export class Tasks {
  private readonly tasksService = inject(TasksService);
  private readonly coursesService = inject(CoursesService);
  private readonly destroyRef = inject(DestroyRef);

  readonly tasks = signal<AcademicTask[]>([]);
  readonly courses = signal<Course[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly showForm = signal(false);
  readonly editingTask = signal<AcademicTask | null>(null);
  readonly filter = signal<TaskFilter>('all');
  readonly filters: Array<{ id: TaskFilter; label: string }> = [
    { id: 'all', label: 'Todas' },
    { id: 'pendiente', label: 'Pendientes' },
    { id: 'en_progreso', label: 'En progreso' },
    { id: 'atrasada', label: 'Atrasadas' },
    { id: 'completada', label: 'Completadas' },
  ];
  readonly now = signal(Date.now());

  private readonly model = signal<TaskFormModel>({
    courseId: '', title: '', description: '', dueDate: localDateTime(), priority: 'media',
  });

  readonly taskForm = form(this.model, (schema) => {
    required(schema.title, { message: 'El título es obligatorio' });
    minLength(schema.title, 3, { message: 'Escribe al menos 3 caracteres' });
  });

  readonly filteredTasks = computed(() => {
    const selected = this.filter();
    const now = this.now();
    return this.tasks().filter((task) => {
      if (selected === 'all') return true;
      if (selected === 'atrasada') {
        return task.status !== 'completada' && task.status !== 'cancelada'
          && !!task.dueDate && new Date(task.dueDate).getTime() < now;
      }
      return task.status === selected;
    });
  });

  constructor() {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.coursesService.getCourses().pipe(
      switchMap((courses) => {
        const names = new Map<number, string>(courses.map((course) => [course.id, course.name]));
        return this.tasksService.listar(names).pipe(map((tasks) => ({ courses, tasks })));
      }),
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.loading.set(false)),
    ).subscribe({
      next: ({ courses, tasks }) => {
        this.courses.set(courses);
        this.tasks.set(tasks);
      },
      error: (error: unknown) => this.error.set(getApiErrorMessage(error)),
    });
  }

  setFilter(filter: TaskFilter): void {
    this.filter.set(filter);
  }

  openForm(): void {
    this.editingTask.set(null);
    this.model.set({
      courseId: '', title: '', description: '', dueDate: localDateTime(), priority: 'media',
    });
    this.error.set(null);
    this.showForm.set(true);
  }

  save(event: Event): void {
    event.preventDefault();
    if (this.taskForm().invalid()) {
      this.taskForm.title().markAsTouched();
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    const editing = this.editingTask();
    const request = editing
      ? this.tasksService.editar(editing.id, this.model(), editing.status)
      : this.tasksService.crear(this.model());
    request.pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.saving.set(false)),
    ).subscribe({
      next: (created: TareaApi) => {
        const course = this.courses().find((item) => item.id === created.id_curso);
        const updatedTask = toAcademicTask(created, course?.name ?? (created.id_curso === null ? '' : 'Curso de otro periodo'));
        this.tasks.update((items) => editing
          ? items.map((item) => item.id === editing.id ? updatedTask : item)
          : [updatedTask, ...items]);
        this.showForm.set(false);
        this.editingTask.set(null);
      },
      error: (error: unknown) => this.error.set(getApiErrorMessage(error)),
    });
  }


  edit(task: AcademicTask): void {
    this.editingTask.set(task);
    this.model.set({
      courseId: task.courseId === null ? '' : String(task.courseId),
      title: task.title,
      description: task.description,
      dueDate: task.dueDate ? task.dueDate.slice(0, 16) : '',
      priority: task.priority,
    });
    this.error.set(null);
    this.showForm.set(true);
  }

  changeStatus(task: AcademicTask, status: TaskStatus): void {
    this.tasksService.actualizar(task, status).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (updated) => {
        const course = this.courses().find((item) => item.id === updated.id_curso);
        this.tasks.update((items) => items.map((item) => item.id === task.id
          ? toAcademicTask(updated, course?.name ?? (updated.id_curso === null ? '' : 'Curso de otro periodo')) : item));
      },
      error: (error: unknown) => this.error.set(getApiErrorMessage(error)),
    });
  }

  remove(task: AcademicTask): void {
    if (!confirm(`¿Eliminar la tarea «${task.title}»?`)) return;
    this.tasksService.eliminar(task.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.tasks.update((items) => items.filter((item) => item.id !== task.id)),
      error: (error: unknown) => this.error.set(getApiErrorMessage(error)),
    });
  }

  isOverdue(task: AcademicTask): boolean {
    return task.status !== 'completada' && task.status !== 'cancelada'
      && !!task.dueDate && new Date(task.dueDate).getTime() < this.now();
  }

  statusLabel(status: TaskStatus): string {
    return ({ pendiente: 'Pendiente', en_progreso: 'En progreso', completada: 'Completada', cancelada: 'Cancelada' })[status];
  }

  priorityLabel(priority: AcademicTask['priority']): string {
    return ({ baja: 'Baja', media: 'Media', alta: 'Alta' })[priority];
  }
}
