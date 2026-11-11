import { Component, inject, signal, computed } from '@angular/core';
import { form, FormField, required, minLength, min, max } from '@angular/forms/signals';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { PlannerService } from '../../services/planner.service';
import { StudySession, StudySessionStatus } from '../../interfaces/study-session.interface';
import { StudySessionForm } from '../../interfaces/study-session-form.interface';
import { Course } from '../../../courses/interfaces/course.interface';

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
  imports: [PageHeader, EmptyState, FormField],
  templateUrl: './planner.html',
  styleUrl: './planner.css',
})
export class Planner {
  private readonly plannerService = inject(PlannerService);

  readonly showForm = signal(false);
  readonly filter = signal<'all' | StudySessionStatus>('all');
  /** Lista que se pinta en la vista (como listaPersonas en clase) */
  readonly listaSesiones = computed(() => this.plannerService.filtrar(this.filter()));
  readonly cursos: Course[] = this.plannerService.mostrarCursos();

  /** 2. Modelo signal */
  private readonly sesionModelo = signal<StudySessionForm>({
    courseId: String(this.cursos[0]?.id ?? 1),
    title: '',
    description: '',
    date: getLocalDateString(),
    startTime: '09:00',
    durationMinutes: 60,
  });

  /** 3. Formulario Signal */
  readonly sesionFormulario = form(this.sesionModelo, (esquema) => {
    required(esquema.courseId, { message: 'Selecciona un curso' });
    required(esquema.title, { message: 'El título es obligatorio' });
    minLength(esquema.title, 3, { message: 'Mínimo 3 caracteres' });
    required(esquema.date, { message: 'La fecha es obligatoria' });
    required(esquema.startTime, { message: 'La hora es obligatoria' });
    required(esquema.durationMinutes, { message: 'La duración es obligatoria' });
    min(esquema.durationMinutes, 15, { message: 'Mínimo 15 minutos' });
    max(esquema.durationMinutes, 240, { message: 'Máximo 240 minutos' });
  });

  openForm() {
    this.sesionModelo.set({
      courseId: String(this.cursos[0]?.id ?? 1),
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

  /** Guardar (como en clase: preventDefault + servicio) */
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
    this.plannerService.guardar(datos);
    this.limpiar();
    this.showForm.set(false);
    this.toast('Sesión agregada al plan de estudio.');
  }

  limpiar() {
    this.sesionModelo.set({
      courseId: String(this.cursos[0]?.id ?? 1),
      title: '',
      description: '',
      date: getLocalDateString(),
      startTime: '09:00',
      durationMinutes: 60,
    });
  }

  complete(session: StudySession) {
    this.plannerService.completar(session.id);
    this.toast('Sesión marcada como completada.');
  }

  cancel(session: StudySession) {
    this.plannerService.cancelar(session.id);
  }

  statusLabel(s: StudySessionStatus): string {
    switch (s) {
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
