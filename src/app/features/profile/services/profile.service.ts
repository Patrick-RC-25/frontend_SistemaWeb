import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Student } from '../interfaces/student.interface';
import { AcademicGoal } from '../interfaces/academic-goal.interface';
import { ProfileForm } from '../interfaces/profile-form.interface';

interface PerfilApi {
  id_perfil: number;
  id_usuario: number;
  nombres: string;
  apellidos: string;
  universidad: string | null;
  carrera: string | null;
  ciclo: string | null;
  foto_url: string | null;
}

interface ObjetivoApi {
  id_objetivo: number;
  id_usuario: number;
  id_curso: number | null;
  titulo: string;
  descripcion: string | null;
  fecha_inicio: string;
  fecha_limite: string | null;
  progreso: number;
  estado: 'pendiente' | 'en_progreso' | 'completado' | 'cancelado';
  total_tareas: number;
  tareas_completadas: number;
}

function toAcademicGoal(objetivo: ObjetivoApi): AcademicGoal {
  return {
    id: objetivo.id_objetivo,
    title: objetivo.titulo,
    currentValue: objetivo.tareas_completadas,
    targetValue: objetivo.total_tareas,
    progressPercentage: objetivo.progreso,
    totalTasks: objetivo.total_tareas,
    completedTasks: objetivo.tareas_completadas,
    description: objetivo.descripcion ?? undefined,
    courseId: objetivo.id_curso,
    startDate: objetivo.fecha_inicio,
    limitDate: objetivo.fecha_limite,
    status: objetivo.estado,
  };
}

function toStudent(perfil: PerfilApi, email: string): Student {
  const initials = `${perfil.nombres[0] ?? ''}${perfil.apellidos[0] ?? ''}`.toUpperCase();
  return {
    id: perfil.id_usuario,
    firstName: perfil.nombres,
    lastName: perfil.apellidos,
    email,
    university: perfil.universidad ?? '',
    career: perfil.carrera ?? '',
    cycle: perfil.ciclo ?? '',
    initials,
    avatarUrl: perfil.foto_url ?? undefined,
  };
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  mostrarEstudiante(email: string = ''): Observable<Student> {
    return this.http.get<PerfilApi>(`${this.apiUrl}/perfil`).pipe(map((perfil) => toStudent(perfil, email)));
  }

  mostrarObjetivos(): Observable<AcademicGoal[]> {
    return this.http.get<ObjetivoApi[]>(`${this.apiUrl}/objetivos`).pipe(
      map((lista) => lista.map(toAcademicGoal)),
    );
  }

  crearObjetivo(datos: { titulo: string; descripcion: string; fecha_inicio: string; fecha_limite: string | null }): Observable<AcademicGoal> {
    return this.http.post<ObjetivoApi>(`${this.apiUrl}/objetivos`, {
      id_curso: null,
      titulo: datos.titulo.trim(),
      descripcion: datos.descripcion.trim() || null,
      fecha_inicio: datos.fecha_inicio,
      fecha_limite: datos.fecha_limite,
    }).pipe(map(toAcademicGoal));
  }


  eliminarObjetivo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/objetivos/${id}`);
  }

  guardarPerfil(formulario: ProfileForm, email: string, fotoUrl: string | null): Observable<Student> {
    const body = {
      nombres: formulario.firstName.trim(),
      apellidos: formulario.lastName.trim(),
      universidad: formulario.university.trim() || null,
      carrera: formulario.career.trim() || null,
      ciclo: formulario.cycle.trim() || null,
      foto_url: fotoUrl,
    };
    return this.http.put<PerfilApi>(`${this.apiUrl}/perfil`, body)
      .pipe(map((perfil) => toStudent(perfil, email)));
  }
}
