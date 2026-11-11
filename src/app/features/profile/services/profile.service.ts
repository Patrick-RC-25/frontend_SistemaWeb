import { Injectable, inject } from '@angular/core';
import { MockDataService } from '../../../core/services/mock-data.service';
import { Student } from '../interfaces/student.interface';
import { AcademicGoal } from '../interfaces/academic-goal.interface';
import { NotificationSettings } from '../interfaces/notification-settings.interface';
import { ProfileForm } from '../interfaces/profile-form.interface';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly mock = inject(MockDataService);

  mostrarEstudiante(): Student {
    return this.mock.student();
  }

  mostrarObjetivos(): AcademicGoal[] {
    return this.mock.goals();
  }

  mostrarNotificaciones(): NotificationSettings {
    return this.mock.notificationSettings();
  }

  guardarPerfil(formulario: ProfileForm): void {
    const initials = (formulario.firstName[0] + (formulario.lastName[0] || '')).toUpperCase();
    this.mock.updateStudent({
      firstName: formulario.firstName.trim(),
      lastName: formulario.lastName.trim(),
      email: formulario.email.trim(),
      career: formulario.career.trim(),
      semester: +formulario.semester,
      initials,
    });
  }

  guardarNotificaciones(settings: NotificationSettings): void {
    this.mock.updateNotifications(settings);
  }
}
