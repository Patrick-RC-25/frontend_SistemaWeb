import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { form, FormField, required, email, minLength } from '@angular/forms/signals';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { getApiErrorMessage } from '../../../../core/api/api-error';

interface RegistroModelo {
  email: string;
  password: string;
  nombres: string;
  apellidos: string;
  universidad: string;
  carrera: string;
  ciclo: string;
}

function validarContrasena(password: string): string | null {
  if (password.length < 8) return 'Mínimo 8 caracteres';
  if (!/[A-ZÁÉÍÓÚÑ]/.test(password)) return 'Debe incluir al menos una mayúscula';
  if (!/[a-záéíóúñ]/.test(password)) return 'Debe incluir al menos una minúscula';
  if (!/[0-9]/.test(password)) return 'Debe incluir al menos un número';
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormField, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  private readonly modelo = signal<RegistroModelo>({
    email: '',
    password: '',
    nombres: '',
    apellidos: '',
    universidad: '',
    carrera: '',
    ciclo: '',
  });

  readonly formReg = form(this.modelo, (e) => {
    required(e.email, { message: 'El correo es obligatorio' });
    email(e.email, { message: 'Correo no válido' });
    required(e.password, { message: 'La contraseña es obligatoria' });
    minLength(e.password, 8, { message: 'Mínimo 8 caracteres' });
    required(e.nombres, { message: 'Nombres obligatorios' });
    required(e.apellidos, { message: 'Apellidos obligatorios' });
  });

  guardar(ev: Event) {
    ev.preventDefault();
    if (this.formReg().invalid()) {
      this.formReg.email().markAsTouched();
      this.formReg.password().markAsTouched();
      this.formReg.nombres().markAsTouched();
      this.formReg.apellidos().markAsTouched();
      return;
    }

    const m = this.modelo();
    const pwdError = validarContrasena(m.password);
    if (pwdError) {
      this.error.set(pwdError);
      return;
    }

    this.error.set(null);
    this.loading.set(true);
    this.auth
      .register({
        email: m.email,
        contrasena: m.password,
        nombres: m.nombres,
        apellidos: m.apellidos,
        universidad: m.universidad || null,
        carrera: m.carrera || null,
        ciclo: m.ciclo || null,
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => this.router.navigateByUrl('/inicio'),
        error: (err) =>
          this.error.set(getApiErrorMessage(err, 'No se pudo registrar la cuenta')),
      });
  }
}
