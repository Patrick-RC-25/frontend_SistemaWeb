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
  @Output() markDone = new EventEmitter<number>();
  @Output() action = new EventEmitter<AcademicAlert>();

  priorityLabel(p: string): string {
    switch (p) {
      case 'urgent': return 'Urgente';
      case 'important': return 'Importante';
      default: return 'Sugerencia';
    }
  }

  kindIcon(k: string): string {
    switch (k) {
      case 'evaluation': return 'bi-clipboard-check';
      case 'task': return 'bi-journal-check';
      default: return 'bi-eye';
    }
  }
}
