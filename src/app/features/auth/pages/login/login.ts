import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { form, FormField, required, email, minLength } from '@angular/forms/signals';
import { Logo } from '../../../../shared/components/logo/logo';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../interfaces/login-request.interface';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormField, Logo],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly showPassword = signal(false);

  /** 2. Modelo (signal) */
  private readonly loginModelo = signal<LoginRequest>({
    email: 'demo@carlito.app',
    password: 'demo',
  });

  /** 3. Formulario Signal */
  readonly loginFormulario = form(this.loginModelo, (esquema) => {
    required(esquema.email, { message: 'El correo es obligatorio' });
    email(esquema.email, { message: 'Ingresa un correo válido' });
    required(esquema.password, { message: 'La contraseña es obligatoria' });
    minLength(esquema.password, 4, { message: 'Mínimo 4 caracteres' });
  });

  async guardar(evento: Event) {
    evento.preventDefault();

    // Marcar campos como touched si el form es inválido
    if (this.loginFormulario().invalid()) {
      this.loginFormulario.email().markAsTouched();
      this.loginFormulario.password().markAsTouched();
      return;
    }

    this.error.set(null);
    this.loading.set(true);

    try {
      const datos: LoginRequest = {
        email: this.loginModelo().email,
        password: this.loginModelo().password,
      };
      await this.auth.login(datos);
      await this.router.navigateByUrl('/inicio');
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'No se pudo iniciar sesión');
    } finally {
      this.loading.set(false);
    }
  }
}
