import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/login/login').then((m) => m.Login),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout').then((m) => m.MainLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      {
        path: 'inicio',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'alertas',
        loadComponent: () =>
          import('./features/alerts/pages/alerts/alerts').then((m) => m.Alerts),
      },
      {
        path: 'cursos',
        loadComponent: () =>
          import('./features/courses/pages/courses/courses').then((m) => m.Courses),
      },
      {
        path: 'rendimiento',
        loadComponent: () =>
          import('./features/performance/pages/performance/performance').then((m) => m.Performance),
      },
      {
        path: 'planificacion',
        loadComponent: () =>
          import('./features/planner/pages/planner/planner').then((m) => m.Planner),
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./features/profile/pages/profile/profile').then((m) => m.Profile),
      },
    ],
  },
  { path: '**', redirectTo: 'inicio' },
];
