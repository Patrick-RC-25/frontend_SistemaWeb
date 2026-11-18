/** Cuerpo que espera el backend (Semana 13 / RandomStudyDB). */
export interface LoginApiRequest {
  email: string;
  contrasena: string;
}

export interface RegistroApiRequest {
  email: string;
  contrasena: string;
  nombres: string;
  apellidos: string;
  universidad?: string | null;
  carrera?: string | null;
  ciclo?: string | null;
}

/** Token JWT devuelto por POST /auth/login y /auth/register */
export interface TokenApiResponse {
  access_token: string;
  token_type: string;
  email: string;
  id_usuario: number;
}
