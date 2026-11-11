import { Component, inject, signal } from '@angular/core';
import { form, FormField, required, email, min, max, minLength } from '@angular/forms/signals';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { ProgressBar } from '../../../../shared/components/progress-bar/progress-bar';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ProfileForm } from '../../interfaces/profile-form.interface';
import { NotificationSettings } from '../../interfaces/notification-settings.interface';
import { AcademicGoal } from '../../interfaces/academic-goal.interface';
import { Student } from '../../interfaces/student.interface';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [PageHeader, ProgressBar, FormField],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  private readonly profileService = inject(ProfileService);
  private readonly auth = inject(AuthService);

  readonly saved = signal(false);
  readonly student = signal<Student>(this.profileService.mostrarEstudiante());
  readonly goals = signal<AcademicGoal[]>(this.profileService.mostrarObjetivos());

  /** Modelo perfil */
  private readonly perfilModelo = signal<ProfileForm>({
    firstName: this.student().firstName,
    lastName: this.student().lastName,
    email: this.student().email,
    career: this.student().career,
    semester: this.student().semester,
  });

  readonly perfilFormulario = form(this.perfilModelo, (esquema) => {
    required(esquema.firstName, { message: 'Los nombres son obligatorios' });
    minLength(esquema.firstName, 2, { message: 'Mínimo 2 caracteres' });
    required(esquema.lastName, { message: 'Los apellidos son obligatorios' });
    minLength(esquema.lastName, 2, { message: 'Mínimo 2 caracteres' });
    required(esquema.email, { message: 'El correo es obligatorio' });
    email(esquema.email, { message: 'Correo no válido' });
    required(esquema.career, { message: 'La carrera es obligatoria' });
    required(esquema.semester, { message: 'El semestre es obligatorio' });
    min(esquema.semester, 1, { message: 'Mínimo semestre 1' });
    max(esquema.semester, 12, { message: 'Máximo semestre 12' });
  });

  /** Modelo notificaciones */
  private readonly notifModelo = signal<NotificationSettings>(
    this.profileService.mostrarNotificaciones()
  );

  readonly notifFormulario = form(this.notifModelo);

  guardarPerfil(evento: Event) {
    evento.preventDefault();
    if (this.perfilFormulario().invalid()) {
      this.perfilFormulario.firstName().markAsTouched();
      this.perfilFormulario.lastName().markAsTouched();
      this.perfilFormulario.email().markAsTouched();
      this.perfilFormulario.career().markAsTouched();
      this.perfilFormulario.semester().markAsTouched();
      return;
    }
    const datos: ProfileForm = { ...this.perfilModelo() };
    this.profileService.guardarPerfil(datos);
    this.student.set(this.profileService.mostrarEstudiante());
    this.flashSaved();
  }

  guardarNotificaciones(evento: Event) {
    evento.preventDefault();
    this.profileService.guardarNotificaciones({ ...this.notifModelo() });
    this.flashSaved();
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
