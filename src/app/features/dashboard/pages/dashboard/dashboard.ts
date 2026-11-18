import { Component, inject, signal, DestroyRef } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatCard } from '../../../../shared/components/stat-card/stat-card';
import { ProgressBar } from '../../../../shared/components/progress-bar/progress-bar';
import { AlertCard } from '../../../../shared/components/alert-card/alert-card';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardData } from '../../interfaces/dashboard.interface';
import { AcademicAlert } from '../../../alerts/interfaces/alert.interface';
import { getApiErrorMessage } from '../../../../core/api/api-error';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, PageHeader, StatCard, ProgressBar, AlertCard, LoadingSpinner, DecimalPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly dashboardService = inject(DashboardService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly data = signal<DashboardData | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.cargar();
  }

  onMarkRead(id: number): void {
    this.dashboardService
      .markAlertRead(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.cargar(),
        error: (error) => this.error.set(getApiErrorMessage(error)),
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

  private cargar(): void {
    this.loading.set(true);
    this.error.set(null);

    this.dashboardService
      .getDashboard()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.data.set(data);
          this.loading.set(false);
        },
        error: (error) => {
          this.error.set(getApiErrorMessage(error));
          this.loading.set(false);
        },
      });
  }
}
