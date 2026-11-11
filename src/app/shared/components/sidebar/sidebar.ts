import { Component, inject, computed } from '@angular/core';
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

  readonly student = this.auth.currentStudent;
  readonly activeAlerts = computed(() => this.alerts.contarPendientes());

  readonly navItems: NavItem[] = [
    { path: '/inicio', label: 'Inicio', icon: 'bi-house-door' },
    { path: '/alertas', label: 'Alertas', icon: 'bi-bell' },
    { path: '/cursos', label: 'Cursos', icon: 'bi-book' },
    { path: '/rendimiento', label: 'Rendimiento', icon: 'bi-graph-up-arrow' },
    { path: '/planificacion', label: 'Planificación', icon: 'bi-calendar3' },
    { path: '/perfil', label: 'Perfil', icon: 'bi-person' },
  ];

  logout(): void {
    this.auth.logout();
  }
}
