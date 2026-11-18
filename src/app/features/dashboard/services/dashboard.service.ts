import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DashboardData } from '../interfaces/dashboard.interface';
import { AcademicAlert } from '../../alerts/interfaces/alert.interface';
import { AlertsService } from '../../alerts/services/alerts.service';
import { AlertaApi } from '../../alerts/interfaces/alerta-api.interface';
import { toAlert } from '../../alerts/mappers/alert.mapper';

interface DashboardApi {
  promedio_general: number | null;
  cursos_activos: number;
  tareas_pendientes: number;
  alertas_no_leidas: number;
  objetivos_activos: number;
  sesiones_hoy: number;
  cursos: Array<{
    id_curso: number;
    nombre: string;
    nota_objetivo: number | null;
    promedio_actual: number | null;
  }>;
  tareas_proximas: Array<{ id_tarea: number; titulo: string; fecha_vencimiento: string | null }>;
  sesiones_hoy_lista: Array<{ id_sesion: number; titulo: string }>;
  objetivos: Array<{
    id_objetivo: number;
    id_curso: number | null;
    titulo: string;
    descripcion: string | null;
    fecha_inicio: string;
    fecha_limite: string | null;
    progreso: number;
    estado: string;
  }>;
  alertas_recientes: AlertaApi[];
  necesita_atencion: string[];
}

interface PerfilApi {
  nombres: string;
  apellidos: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly alertsService = inject(AlertsService);
  private readonly dashboardUrl = `${environment.apiUrl}/dashboard/resumen`;

  markAlertRead(id: number): Observable<AcademicAlert> {
    return this.alertsService.marcarLeida(id);
  }

  getDashboard(): Observable<DashboardData> {
    return forkJoin({
      resumen: this.http.get<DashboardApi>(this.dashboardUrl),
      perfil: this.http.get<PerfilApi>(`${environment.apiUrl}/perfil`),
    }).pipe(
      map(({ resumen, perfil }) => {
        const objetivos = resumen.objetivos ?? [];
        const objetivo = objetivos[0];
        const metasCurso = resumen.cursos
          .map((curso) => curso.nota_objetivo)
          .filter((value): value is number => value !== null);
        const targetAverage = metasCurso.length
          ? metasCurso.reduce((total, value) => total + value, 0) / metasCurso.length
          : null;
        const priorityAlerts: AcademicAlert[] = (resumen.alertas_recientes ?? []).map(toAlert);
        const recommendations = resumen.necesita_atencion ?? [];

        return {
          studentName: `${perfil.nombres} ${perfil.apellidos}`.trim(),
          currentAverage: resumen.promedio_general,
          targetAverage,
          activeAlerts: resumen.alertas_no_leidas,
          pendingActivities: resumen.sesiones_hoy + resumen.tareas_pendientes,
          mainRecommendation: recommendations[0] ?? (
            resumen.cursos_activos === 0
              ? 'Todavía no tienes cursos registrados. Agrega tus cursos para comenzar.'
              : 'No hay situaciones que requieran atención inmediata. Mantén tu planificación.'
          ),
          recommendationDetail: recommendations.slice(1, 3).join(' ') ||
            `${resumen.tareas_pendientes} tareas pendientes · ${resumen.objetivos_activos} objetivos activos.`,
          academicGoal: objetivo ? {
            id: objetivo.id_objetivo,
            title: objetivo.titulo,
            currentValue: objetivo.progreso,
            targetValue: 100,
            progressPercentage: objetivo.progreso,
            description: objetivo.descripcion ?? undefined,
            courseId: objetivo.id_curso,
            startDate: objetivo.fecha_inicio,
            limitDate: objetivo.fecha_limite,
            status: objetivo.estado as 'pendiente' | 'en_progreso' | 'completado' | 'cancelado',
          } : {
            id: 0,
            title: 'Aún no tienes objetivos',
            currentValue: 0,
            targetValue: 100,
            progressPercentage: 0,
            description: 'Crea un objetivo académico para hacer seguimiento a tu avance.',
            courseId: null,
            startDate: '',
            limitDate: null,
            status: 'pendiente',
          },
          priorityAlerts,
        } satisfies DashboardData;
      }),
    );
  }
}
