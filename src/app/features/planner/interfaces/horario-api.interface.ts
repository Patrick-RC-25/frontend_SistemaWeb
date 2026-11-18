export interface HorarioApi {
  id_horario: number;
  id_curso: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  aula: string | null;
}

export interface HorarioCreateApi {
  id_curso: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  aula: string | null;
}
