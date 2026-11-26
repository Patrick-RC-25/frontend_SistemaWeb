import { HttpErrorResponse } from '@angular/common/http';

export function getApiErrorMessage(
  error: unknown,
  fallback = 'No se pudo completar la operación. Inténtalo nuevamente.',
): string {
  if (!(error instanceof HttpErrorResponse)) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      return 'La solicitud tardó demasiado. El servidor no respondió a tiempo; inténtalo nuevamente.';
    }
    if (error instanceof Error && error.name === 'AbortError') {
      return 'La petición se canceló. Intenta de nuevo.';
    }
    return fallback;
  }

  if (error.status === 0) {
    return 'No se pudo conectar con el servidor. Verifica que el backend esté en http://127.0.0.1:8000';
  }

  const body = error.error;
  if (typeof body?.detail === 'string' && body.detail.trim()) {
    return body.detail;
  }
  if (Array.isArray(body?.detail) && body.detail.length > 0) {
    const first = body.detail[0];
    if (typeof first === 'string') return first;
    if (first?.msg) return String(first.msg);
  }
  if (typeof body === 'string' && body.trim()) {
    return body;
  }

  if (error.status === 409) return 'Ese correo ya está registrado.';
  if (error.status === 401) return 'Credenciales incorrectas.';
  if (error.status === 503) return 'Base de datos no disponible. Revisa SQL Server y el archivo .env';

  return fallback;
}
