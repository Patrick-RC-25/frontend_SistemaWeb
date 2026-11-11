import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatCard } from '../../../../shared/components/stat-card/stat-card';
import { ProgressBar } from '../../../../shared/components/progress-bar/progress-bar';
import { AlertCard } from '../../../../shared/components/alert-card/alert-card';
import { DashboardService } from '../../services/dashboard.service';
import { AcademicAlert } from '../../../alerts/interfaces/alert.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, PageHeader, StatCard, ProgressBar, AlertCard],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly dashboardService = inject(DashboardService);

  readonly data = computed(() => this.dashboardService.getDashboard());

  onMarkDone(id: number): void {
    this.dashboardService.markAlertCompleted(id);
  }

  onAction(_alert: AcademicAlert): void {
    // Las acciones contextuales se conectarán con la navegación de cada módulo.
  }
}
