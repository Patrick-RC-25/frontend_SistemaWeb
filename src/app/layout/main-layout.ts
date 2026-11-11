import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../shared/components/sidebar/sidebar';
import { MobileNav } from '../shared/components/mobile-nav/mobile-nav';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, Sidebar, MobileNav],
  template: `
    <div class="app-shell">
      <app-sidebar />
      <div class="app-main">
        <div class="app-content">
          <div class="content-container">
            <router-outlet />
          </div>
        </div>
        <app-mobile-nav />
      </div>
    </div>
  `,
})
export class MainLayout {}
