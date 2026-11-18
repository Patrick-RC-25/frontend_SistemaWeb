import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoginRequest } from '../interfaces/login-request.interface';
import { AuthResponse } from '../interfaces/auth-response.interface';
import {
  LoginApiRequest,
  RegistroApiRequest,
  TokenApiResponse,
} from '../interfaces/login-api.interface';
import { toAuthResponse } from '../mappers/auth.mapper';

const CLAVE_SESION = 'randomstudy.session';

interface SesionGuardada {
  email: string;
  token: string;
  idUsuario: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly esNavegador = isPlatformBrowser(this.platformId);

  private readonly tokenSignal = signal<string | null>(null);
  private readonly emailSignal = signal<string | null>(null);
  private readonly idUsuarioSignal = signal<number | null>(null);

  readonly isAuthenticated = computed(
    () => this.tokenSignal() !== null && this.emailSignal() !== null,
  );
  readonly currentEmail = this.emailSignal.asReadonly();
  readonly currentUserId = this.idUsuarioSignal.asReadonly();

  constructor() {
    if (!this.esNavegador) return;
    const sesion = this.leerSesion();
    if (sesion?.token && sesion.email) {
      this.tokenSignal.set(sesion.token);
      this.emailSignal.set(sesion.email);
      this.idUsuarioSignal.set(sesion.idUsuario);
    }
  }

  obtenerToken(): string | null {
    return this.tokenSignal();
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    const body: LoginApiRequest = {
      email: request.email.trim().toLowerCase(),
      contrasena: request.password,
    };
    return this.http
      .post<TokenApiResponse>(`${environment.apiUrl}/auth/login`, body)
      .pipe(map(toAuthResponse), tap((res) => this.aplicarSesion(res)));
  }

  register(datos: RegistroApiRequest): Observable<AuthResponse> {
    return this.http
      .post<TokenApiResponse>(`${environment.apiUrl}/auth/register`, {
        ...datos,
        email: datos.email.trim().toLowerCase(),
      })
      .pipe(map(toAuthResponse), tap((res) => this.aplicarSesion(res)));
  }

  logout(): void {
    const clearSession = () => {
      this.tokenSignal.set(null);
      this.emailSignal.set(null);
      this.idUsuarioSignal.set(null);
      if (this.esNavegador) localStorage.removeItem(CLAVE_SESION);
      void this.router.navigateByUrl('/login');
    };

    if (!this.tokenSignal()) {
      clearSession();
      return;
    }

    this.http.post<void>(`${environment.apiUrl}/auth/logout`, {}).subscribe({
      next: clearSession,
      error: clearSession,
    });
  }

  private aplicarSesion(res: AuthResponse): void {
    this.tokenSignal.set(res.token);
    this.emailSignal.set(res.email);
    this.idUsuarioSignal.set(res.idUsuario);
    if (this.esNavegador) {
      const sesion: SesionGuardada = {
        email: res.email,
        token: res.token,
        idUsuario: res.idUsuario,
      };
      localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
    }
  }

  private leerSesion(): SesionGuardada | null {
    try {
      const raw = localStorage.getItem(CLAVE_SESION);
      return raw ? (JSON.parse(raw) as SesionGuardada) : null;
    } catch {
      return null;
    }
  }
}
