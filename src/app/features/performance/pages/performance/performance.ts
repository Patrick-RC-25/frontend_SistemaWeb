import {
  Component,
  inject,
  computed,
  viewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  effect,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser, DecimalPipe } from '@angular/common';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatCard } from '../../../../shared/components/stat-card/stat-card';
import { ProgressBar } from '../../../../shared/components/progress-bar/progress-bar';
import { PerformanceService } from '../../services/performance.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [PageHeader, StatCard, ProgressBar, DecimalPipe],
  templateUrl: './performance.html',
  styleUrl: './performance.css',
})
export class Performance implements AfterViewInit, OnDestroy {
  private readonly performanceService = inject(PerformanceService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly data = computed(() => this.performanceService.getPerformance());
  private chart?: Chart;
  readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('chartCanvas');

  constructor() {
    effect(() => {
      this.data();
      if (this.isBrowser) {
        queueMicrotask(() => this.renderChart());
      }
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
    if (!canvas) return;

    const performance = this.data();
    this.chart?.destroy();

    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: performance.weeklyHistory.map((week) => week.week),
        datasets: [
          {
            label: 'Promedio',
            data: performance.weeklyHistory.map((week) => week.average),
            borderColor: '#4f46e5',
            backgroundColor: 'rgba(79, 70, 229, 0.12)',
            fill: true,
            tension: 0.35,
            pointRadius: 4,
            pointBackgroundColor: '#4f46e5',
          },
          {
            label: 'Meta',
            data: performance.weeklyHistory.map((week) => week.goal),
            borderColor: '#10b981',
            borderDash: [6, 4],
            pointRadius: 0,
            fill: false,
            tension: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
        scales: {
          y: {
            min: 12,
            max: 20,
            ticks: { stepSize: 1 },
            grid: { color: '#f1f5f9' },
          },
          x: { grid: { display: false } },
        },
      },
    });
  }
}
