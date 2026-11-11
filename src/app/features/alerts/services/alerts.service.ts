import { Injectable, inject } from '@angular/core';
import { MockDataService } from '../../../core/services/mock-data.service';
import { AcademicAlert, AlertPriority } from '../interfaces/alert.interface';

export type AlertFilter = 'all' | 'pending' | 'completed' | AlertPriority;

@Injectable({ providedIn: 'root' })
export class AlertsService {
  private readonly mock = inject(MockDataService);

  mostrar(): AcademicAlert[] {
    return this.mock.alerts()();
  }

  filtrar(filtro: AlertFilter): AcademicAlert[] {
    const list = this.mostrar();
    if (filtro === 'all') return list;
    if (filtro === 'pending') return list.filter((a) => !a.completed);
    if (filtro === 'completed') return list.filter((a) => a.completed);
    return list.filter((a) => a.priority === filtro);
  }

  contarPendientes(): number {
    return this.mostrar().filter((alert) => !alert.completed).length;
  }

  marcarAtendido(id: number): void {
    this.mock.markAlertCompleted(id);
  }
}
