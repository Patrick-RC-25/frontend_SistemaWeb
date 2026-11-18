import {
  Component,
  inject,
  signal,
  viewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  effect,
  PLATFORM_ID,
  DestroyRef,
} from '@angular/core';
import { isPlatformBrowser, DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatCard } from '../../../../shared/components/stat-card/stat-card';
import { ProgressBar } from '../../../../shared/components/progress-bar/progress-bar';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { PerformanceService } from '../../services/performance.service';
import { AcademicPerformance } from '../../interfaces/performance.interface';
import { getApiErrorMessage } from '../../../../core/api/api-error';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [PageHeader, StatCard, ProgressBar, LoadingSpinner, EmptyState, DecimalPipe],
  templateUrl: './performance.html',
  styleUrl: './performance.css',
})
export class Performance implements AfterViewInit, OnDestroy {
  private readonly performanceService = inject(PerformanceService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly data = signal<AcademicPerformance | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  private chart?: Chart;
  readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('chartCanvas');

  constructor() {
    effect(() => {
      const performance = this.data();
      if (performance && this.isBrowser) this.renderChart();
    });

    this.performanceService.getPerformance()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.data.set(data);
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.error.set(getApiErrorMessage(error));
          this.loading.set(false);
        },
      });
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) this.renderChart();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private renderChart(): void {
    if (!this.isBrowser) return;
    const canvas = this.canvasRef()?.nativeElement;
    const performance = this.data();
    if (!canvas || !performance || performance.courses.length === 0) return;

    this.chart?.destroy();
    this.chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: performance.courses.map((course) => course.courseName),
        datasets: [
          {
            label: 'Promedio actual',
            data: performance.courses.map((course) => course.average),
            backgroundColor: '#4f46e5',
            borderRadius: 6,
          },
          {
            label: 'Nota objetivo',
            data: performance.courses.map((course) => course.targetAverage),
            backgroundColor: '#10b981',
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: { legend: { position: 'bottom' } },
        scales: {
          x: { min: 0, max: 20, ticks: { stepSize: 2 }, grid: { color: '#f1f5f9' } },
          y: { grid: { display: false } },
        },
      },
    });
  }
}
