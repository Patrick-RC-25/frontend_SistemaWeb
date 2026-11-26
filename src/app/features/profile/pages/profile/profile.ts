import { Component, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { form, FormField, required, minLength } from '@angular/forms/signals';
import { finalize, timeout } from 'rxjs';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { RouterLink } from '@angular/router';
import { ProgressBar } from '../../../../shared/components/progress-bar/progress-bar';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ProfileForm } from '../../interfaces/profile-form.interface';
import { AcademicGoal } from '../../interfaces/academic-goal.interface';
import { Student } from '../../interfaces/student.interface';
import { getApiErrorMessage } from '../../../../core/api/api-error';

interface GoalFormModel {
  title: string;
  description: string;
  startDate: string;
  limitDate: string;
}

function todayString(): string {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [PageHeader, ProgressBar, LoadingSpinner, FormField, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  private readonly profileService = inject(ProfileService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly saved = signal(false);
  readonly student = signal<Student | null>(null);
  readonly goals = signal<AcademicGoal[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly loadError = signal<string | null>(null);
  readonly showGoalForm = signal(false);
  readonly savingGoal = signal(false);

  /** Modelo perfil */
  private readonly perfilModelo = signal<ProfileForm>({
    firstName: '',
    lastName: '',
    university: '',
    career: '',
    cycle: '',
  });

  readonly perfilFormulario = form(this.perfilModelo, (esquema) => {
    required(esquema.firstName, { message: 'Los nombres son obligatorios' });
    minLength(esquema.firstName, 2, { message: 'Mínimo 2 caracteres' });
    required(esquema.lastName, { message: 'Los apellidos son obligatorios' });
    minLength(esquema.lastName, 2, { message: 'Mínimo 2 caracteres' });
    minLength(esquema.university, 2, { message: 'Mínimo 2 caracteres' });
    minLength(esquema.career, 2, { message: 'Mínimo 2 caracteres' });
  });

  private readonly goalModel = signal<GoalFormModel>({
    title: '', description: '', startDate: todayString(), limitDate: '',
  });

  readonly goalForm = form(this.goalModel, (schema) => {
    required(schema.title, { message: 'El título es obligatorio' });
    minLength(schema.title, 3, { message: 'Mínimo 3 caracteres' });
    required(schema.startDate, { message: 'La fecha de inicio es obligatoria' });
  });

  constructor() {
    forkJoin({
      student: this.profileService.mostrarEstudiante(this.auth.currentEmail() ?? ''),
      goals: this.profileService.mostrarObjetivos(),
    })
      .pipe(
        timeout({ first: 15000 }),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: ({ student, goals }) => {
          this.student.set(student);
          this.goals.set(goals);
          this.perfilModelo.set({
            firstName: student.firstName,
            lastName: student.lastName,
            university: student.university,
            career: student.career,
            cycle: student.cycle,
          });
        },
        error: (error) => {
          this.loadError.set(getApiErrorMessage(error));
        },
      });
  }

  guardarPerfil(evento: Event) {
    evento.preventDefault();

    if (this.perfilFormulario().invalid()) {
      this.perfilFormulario.firstName().markAsTouched();
      this.perfilFormulario.lastName().markAsTouched();
      this.perfilFormulario.university().markAsTouched();
      this.perfilFormulario.career().markAsTouched();
      this.perfilFormulario.cycle().markAsTouched();
      return;
    }

    const datos: ProfileForm = { ...this.perfilModelo() };

    this.profileService
      .guardarPerfil(datos, this.auth.currentEmail() ?? '', this.student()?.avatarUrl ?? null)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (student) => {
          this.student.set(student);
          this.perfilModelo.set({
            firstName: student.firstName,
            lastName: student.lastName,
            university: student.university,
            career: student.career,
            cycle: student.cycle,
          });
          
          this.flashSaved();
        },
        error: (error: unknown) => this.error.set(getApiErrorMessage(error)),
      });
  }


  abrirObjetivo(): void {
    this.goalModel.set({ title: '', description: '', startDate: todayString(), limitDate: '' });
    this.error.set(null);
    this.success.set(null);
    this.showGoalForm.set(true);
  }

  guardarObjetivo(event: Event): void {
    event.preventDefault();
    if (this.goalForm().invalid()) {
      this.goalForm.title().markAsTouched();
      this.goalForm.startDate().markAsTouched();
      return;
    }
    const model = this.goalModel();
    if (model.limitDate && model.limitDate < model.startDate) {
      this.error.set('La fecha límite no puede ser anterior a la fecha de inicio.');
      return;
    }
    this.savingGoal.set(true);
    this.error.set(null);
    this.profileService.crearObjetivo({
      titulo: model.title,
      descripcion: model.description,
      fecha_inicio: model.startDate,
      fecha_limite: model.limitDate || null,
    }).pipe(
      timeout({ first: 15000 }),
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.savingGoal.set(false)),
    ).subscribe({
      next: (goal) => {
        this.goals.update((items) => [...items, goal]);
        this.showGoalForm.set(false);
        this.success.set('Objetivo académico guardado correctamente.');
      },
      error: (error: unknown) => this.error.set(getApiErrorMessage(error)),
    });
  }


  eliminarObjetivo(goal: AcademicGoal): void {
    if (!confirm(`¿Eliminar el objetivo «${goal.title}»?`)) return;
    this.profileService.eliminarObjetivo(goal.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.goals.update((items) => items.filter((item) => item.id !== goal.id)),
      error: (error: unknown) => this.error.set(getApiErrorMessage(error)),
    });
  }

  logout() {
    this.auth.logout();
  }

  private flashSaved() {
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2500);
    try {
      import('sweetalert2').then((m) => {
        m.default.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Cambios guardados',
          showConfirmButton: false,
          timer: 2000,
        });
      });
    } catch {
      /* noop */
    }
  }
}
