import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RendimientoApi } from '../interfaces/rendimiento-api.interface';
import { AcademicPerformance } from '../interfaces/performance.interface';
import { toPerformance } from '../mappers/performance.mapper';

@Injectable({ providedIn: 'root' })
export class PerformanceService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/rendimiento`;

  getPerformance(): Observable<AcademicPerformance> {
    return this.http.get<RendimientoApi>(this.apiUrl).pipe(map(toPerformance));
  }
}
