import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.css',
})
export class EmptyState {
  @Input() icon = 'bi-inbox';
  @Input() title = 'Sin elementos';
  @Input() message = 'No hay datos para mostrar por ahora.';
}
