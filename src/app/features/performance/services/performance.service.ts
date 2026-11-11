import { Injectable, inject } from '@angular/core';
import { MockDataService } from '../../../core/services/mock-data.service';
import { AcademicPerformance } from '../interfaces/performance.interface';

@Injectable({ providedIn: 'root' })
export class PerformanceService {
  private readonly mock = inject(MockDataService);

  getPerformance(): AcademicPerformance {
    return this.mock.getPerformance();
  }
}
