import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.css',
})
export class StatCard {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: string | number | null;
  @Input() icon = 'bi-bar-chart';
  @Input() tone: 'default' | 'success' | 'warning' | 'danger' | 'primary' = 'default';
  @Input() hint?: string | null;
}
