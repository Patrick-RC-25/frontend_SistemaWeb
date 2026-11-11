import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  templateUrl: './logo.html',
  styleUrl: './logo.css',
})
export class Logo {
  @Input() compact = false;
  @Input() light = false;
}
