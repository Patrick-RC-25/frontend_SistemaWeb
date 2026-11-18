import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Logo } from '../logo/logo';
import { AuthService } from '../../../features/auth/services/auth.service';
import { AlertsService } from '../../../features/alerts/services/alerts.service';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, Logo],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private readonly auth = inject(AuthService);
  private readonly alerts = inject(AlertsService);

  readonly email = this.auth.currentEmail;
  readonly displayName = computed(() => this.email() ?? 'Estudiante');
  readonly initials = computed(() => {
    const e = this.email() ?? 'U';
    return e.slice(0, 2).toUpperCase();
  });

  readonly activeAlerts = toSignal(
    this.alerts.mostrar().pipe(
      switchMap(() => this.alerts.unreadCount$()),
      catchError(() => of(0)),
    ),
    { initialValue: 0 },
  );

  readonly navItems: NavItem[] = [
    { path: '/inicio', label: 'Inicio', icon: 'bi-house-door' },
    { path: '/alertas', label: 'Alertas', icon: 'bi-bell' },
    { path: '/tareas', label: 'Tareas', icon: 'bi-check2-square' },
    { path: '/cursos', label: 'Cursos', icon: 'bi-book' },
    { path: '/rendimiento', label: 'Rendimiento', icon: 'bi-graph-up-arrow' },
    { path: '/planificacion', label: 'Planificación', icon: 'bi-calendar3' },
    { path: '/perfil', label: 'Perfil', icon: 'bi-person' },
  ];

  logout(): void {
    this.auth.logout();
  }
}
