import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  templateUrl: './progress-bar.html',
  styleUrl: './progress-bar.css',
})
export class ProgressBar {
  @Input() value = 0;
  @Input() max = 100;
  @Input() showLabel = true;
  @Input() tone: 'primary' | 'success' | 'warning' | 'danger' = 'primary';

  get percent(): number {
    if (this.max <= 0) return 0;
    return Math.min(100, Math.max(0, Math.round((this.value / this.max) * 100)));
  }
}
