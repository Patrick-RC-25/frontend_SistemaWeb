import { Component, inject, signal, computed } from '@angular/core';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { AlertCard } from '../../../../shared/components/alert-card/alert-card';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { AlertsService, AlertFilter } from '../../services/alerts.service';
import { AcademicAlert } from '../../interfaces/alert.interface';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [PageHeader, AlertCard, EmptyState],
  templateUrl: './alerts.html',
  styleUrl: './alerts.css',
})
export class Alerts {
  private readonly alertsService = inject(AlertsService);
  readonly filter = signal<AlertFilter>('all');

  readonly listaAlertas = computed(() => this.alertsService.filtrar(this.filter()));

  setFilter(f: AlertFilter) {
    this.filter.set(f);
  }

  onMarkDone(id: number) {
    this.alertsService.marcarAtendido(id);
  }

  onAction(_alert: AcademicAlert) {
    // acción contextual futura
  }
}
