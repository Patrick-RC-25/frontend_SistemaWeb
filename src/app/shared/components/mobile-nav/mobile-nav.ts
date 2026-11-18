import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AlertsService } from '../../../features/alerts/services/alerts.service';

@Component({
  selector: 'app-mobile-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './mobile-nav.html',
  styleUrl: './mobile-nav.css',
})
export class MobileNav {
  private readonly alerts = inject(AlertsService);
  readonly activeAlerts = toSignal(this.alerts.unreadCount$(), { initialValue: 0 });

  readonly items = [
    { path: '/inicio', label: 'Inicio', icon: 'bi-house-door' },
    { path: '/alertas', label: 'Alertas', icon: 'bi-bell' },
    { path: '/tareas', label: 'Tareas', icon: 'bi-check2-square' },
    { path: '/cursos', label: 'Cursos', icon: 'bi-book' },
    { path: '/rendimiento', label: 'Rendim.', icon: 'bi-graph-up' },
    { path: '/planificacion', label: 'Plan', icon: 'bi-calendar3' },
  ];
}
