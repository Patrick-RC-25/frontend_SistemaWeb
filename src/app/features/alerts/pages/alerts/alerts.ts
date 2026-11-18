import { Component, inject, signal, computed, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { form, FormField, required, minLength } from '@angular/forms/signals';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { AlertCard } from '../../../../shared/components/alert-card/alert-card';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';
import { AlertsService, AlertFilter } from '../../services/alerts.service';
import { AcademicAlert } from '../../interfaces/alert.interface';
import { CoursesService } from '../../../courses/services/courses.service';
import { Course } from '../../../courses/interfaces/course.interface';
import { getApiErrorMessage } from '../../../../core/api/api-error';

interface AlertaFormModelo {
  titulo: string;
  mensaje: string;
  idTipo: string;
  idCurso: string;
  fechaProgramada: string;
}

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [PageHeader, AlertCard, EmptyState, LoadingSpinner, FormField],
  templateUrl: './alerts.html',
  styleUrl: './alerts.css',
})
export class Alerts {
  private readonly alertsService = inject(AlertsService);
  private readonly router = inject(Router);
  private readonly coursesService = inject(CoursesService);
  private readonly destroyRef = inject(DestroyRef);

  readonly filter = signal<AlertFilter>('all');
  readonly alerts = signal<AcademicAlert[]>([]);
  readonly cursos = signal<Course[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly showForm = signal(false);
  readonly saving = signal(false);

  readonly listaAlertas = computed(() => this.alertsService.filtrar(this.filter(), this.alerts()));

  private readonly modelo = signal<AlertaFormModelo>({
    titulo: '',
    mensaje: '',
    idTipo: '1',
    idCurso: '',
    fechaProgramada: '',
  });

  readonly alertaForm = form(this.modelo, (e) => {
    required(e.titulo, { message: 'El título es obligatorio' });
    minLength(e.titulo, 2, { message: 'Mínimo 2 caracteres' });
    required(e.mensaje, { message: 'El mensaje es obligatorio' });
  });

  readonly tiposAlerta = [
    { id: '1', nombre: 'Recordatorio' },
    { id: '2', nombre: 'Vencimiento' },
    { id: '3', nombre: 'Rendimiento' },
    { id: '4', nombre: 'Sistema' },
  ];

  constructor() {
    this.recargar();
    this.coursesService
      .getCourses()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (c) => this.cursos.set(c),
        error: () => this.cursos.set([]),
      });
  }

  recargar(): void {
    this.loading.set(true);
    this.error.set(null);
    this.alertsService
      .mostrar()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (alerts) => this.alerts.set(alerts),
        error: (error: unknown) => this.error.set(getApiErrorMessage(error)),
      });
  }

  setFilter(f: AlertFilter) {
    this.filter.set(f);
  }

  openForm() {
    this.modelo.set({
      titulo: '',
      mensaje: '',
      idTipo: '1',
      idCurso: '',
      fechaProgramada: '',
    });
    this.error.set(null);
    this.showForm.set(true);
  }

  guardar(ev: Event) {
    ev.preventDefault();
    if (this.alertaForm().invalid()) {
      this.alertaForm.titulo().markAsTouched();
      this.alertaForm.mensaje().markAsTouched();
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    const m = this.modelo();
    const idCurso = m.idCurso ? Number(m.idCurso) : null;
    this.alertsService
      .crearDetallado({
        titulo: m.titulo.trim(),
        mensaje: m.mensaje.trim(),
        id_tipo_alerta: Number(m.idTipo) || 1,
        id_curso: idCurso && !Number.isNaN(idCurso) ? idCurso : null,
        fecha_programada: m.fechaProgramada?.trim() ? m.fechaProgramada : null,
      })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (a) => {
          this.alerts.update((list) => [a, ...list]);
          this.showForm.set(false);
        },
        error: (error: unknown) => this.error.set(getApiErrorMessage(error)),
      });
  }

  onMarkRead(id: number) {
    this.alertsService.marcarLeida(id).subscribe({
      next: (updated: AcademicAlert) => {
        this.alerts.update((list) =>
          list.map((alert) => (alert.id === updated.id ? updated : alert)),
        );
      },
      error: (error: unknown) => this.error.set(getApiErrorMessage(error)),
    });
  }

  onAction(alert: AcademicAlert): void {
    const route = {
      reminder: '/planificacion',
      task: '/tareas',
      review: '/rendimiento',
      system: '/inicio',
    }[alert.kind];
    this.router.navigateByUrl(route);
  }
}
