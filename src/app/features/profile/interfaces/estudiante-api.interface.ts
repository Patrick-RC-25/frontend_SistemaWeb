export interface EstudianteApi {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
  carrera: string;
  semestre: number;
  iniciales: string;
  avatar_url?: string | null;
}
