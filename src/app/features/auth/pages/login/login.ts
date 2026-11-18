import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { form, FormField, required, email, minLength } from '@angular/forms/signals';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../interfaces/login-request.interface';
import { getApiErrorMessage } from '../../../../core/api/api-error';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormField, RouterLink],
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
    email: '',
    password: '',
  });

  /** 3. Formulario Signal */
  readonly loginFormulario = form(this.loginModelo, (esquema) => {
    required(esquema.email, { message: 'El correo es obligatorio' });
    email(esquema.email, { message: 'Ingresa un correo válido' });
    required(esquema.password, { message: 'La contraseña es obligatoria' });
    minLength(esquema.password, 8, { message: 'Mínimo 8 caracteres' });
  });

  guardar(evento: Event) {
    evento.preventDefault();

    // Marcar campos como touched si el form es inválido
    if (this.loginFormulario().invalid()) {
      this.loginFormulario.email().markAsTouched();
      this.loginFormulario.password().markAsTouched();
      return;
    }

    this.error.set(null);
    this.loading.set(true);

    const datos: LoginRequest = {
      email: this.loginModelo().email,
      password: this.loginModelo().password,
    };

    this.auth
      .login(datos)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => this.router.navigateByUrl('/inicio'),
        error: (error) => this.error.set(getApiErrorMessage(error, 'No se pudo iniciar sesión')),
      });
  }
}
