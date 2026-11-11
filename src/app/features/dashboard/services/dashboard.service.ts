import { Injectable, inject } from '@angular/core';
import { MockDataService } from '../../../core/services/mock-data.service';
import { DashboardData } from '../interfaces/dashboard.interface';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly mock = inject(MockDataService);

  getDashboard(): DashboardData {
    return this.mock.getDashboard();
  }

  markAlertCompleted(id: number): void {
    this.mock.markAlertCompleted(id);
  }
}
