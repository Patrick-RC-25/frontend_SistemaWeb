import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoginRequest } from '../interfaces/login-request.interface';
import { AuthResponse } from '../interfaces/auth-response.interface';
import { MockDataService } from '../../../core/services/mock-data.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
  private readonly mock = inject(MockDataService);

  // La sesión es temporal mientras se utilicen datos simulados.
  // La persistencia y autenticación real se implementarán con el backend.
  private readonly authenticated = signal(false);

  readonly isAuthenticated = computed(() => this.authenticated());
  readonly currentStudent = computed(() =>
    this.authenticated() ? this.mock.student() : null
  );

  login(request: LoginRequest): Promise<AuthResponse> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const email = request.email.trim().toLowerCase();
        const valid = email === 'demo@carlito.app' && request.password === 'demo';

        if (!valid) {
          reject(new Error('Correo o contraseña incorrectos. Usa demo@carlito.app / demo'));
          return;
        }

        this.authenticated.set(true);
        resolve({
          authenticated: true,
          student: this.mock.student(),
        });
      }, 500);
    });
  }

  logout(): void {
    this.authenticated.set(false);
    this.router.navigateByUrl('/login');
  }
}
