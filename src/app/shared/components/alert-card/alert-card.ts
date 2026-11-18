import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AcademicAlert } from '../../../features/alerts/interfaces/alert.interface';

@Component({
  selector: 'app-alert-card',
  standalone: true,
  templateUrl: './alert-card.html',
  styleUrl: './alert-card.css',
})
export class AlertCard {
  @Input({ required: true }) alert!: AcademicAlert;
  @Output() markRead = new EventEmitter<number>();
  @Output() action = new EventEmitter<AcademicAlert>();

  kindIcon(k: string): string {
    switch (k) {
      case 'reminder': return 'bi-alarm';
      case 'task': return 'bi-journal-check';
      case 'review': return 'bi-graph-up';
      default: return 'bi-info-circle';
    }
  }
}
