import { Injectable, signal } from '@angular/core';
import { AcademicAlert } from '../../features/alerts/interfaces/alert.interface';
import { Course } from '../../features/courses/interfaces/course.interface';
import { Grade } from '../../features/courses/interfaces/grade.interface';
import { DashboardData } from '../../features/dashboard/interfaces/dashboard.interface';
import { AcademicPerformance } from '../../features/performance/interfaces/performance.interface';
import { StudySession } from '../../features/planner/interfaces/study-session.interface';
import { AcademicGoal } from '../../features/profile/interfaces/academic-goal.interface';
import { NotificationSettings } from '../../features/profile/interfaces/notification-settings.interface';
import { Student } from '../../features/profile/interfaces/student.interface';

@Injectable({ providedIn: 'root' })
export class MockDataService {
  readonly student = signal<Student>({
    id: 1,
    firstName: 'Carlos',
    lastName: 'Mendoza Rojas',
    email: 'carlos.mendoza@upeu.edu.pe',
    career: 'Ingeniería de Sistemas',
    semester: 6,
    initials: 'CM',
  });

  readonly goals = signal<AcademicGoal[]>([
    {
      id: 1,
      title: 'Promedio general del semestre',
      currentValue: 15.8,
      targetValue: 17.0,
      progressPercentage: 78,
      description: 'Meta personal para mantener beca de excelencia en la Universidad Peruana Unión - Huancayo.',
    },
    {
      id: 2,
      title: 'Cursos aprobados sin aplazos',
      currentValue: 5,
      targetValue: 6,
      progressPercentage: 83,
      description: 'Aprobar todos los cursos del ciclo sin recuperación.',
    },
  ]);

  readonly notificationSettings = signal<NotificationSettings>({
    exams: true,
    tasks: true,
    reviews: true,
  });

  private alertsSignal = signal<AcademicAlert[]>([
    {
      id: 1,
      kind: 'evaluation',
      priority: 'urgent',
      title: 'Parcial de Sistemas Operativos',
      courseName: 'Sistemas Operativos',
      date: 'Mañana · 8:00 a. m.',
      detail: 'Tu promedio actual es 13.8. Necesitas 16.2 en este parcial para acercarte a tu meta.',
      actionLabel: 'Preparar repaso',
      completed: false,
    },
    {
      id: 2,
      kind: 'task',
      priority: 'important',
      title: 'Entrega del proyecto SQL',
      courseName: 'Bases de Datos',
      date: 'En 3 días · 11:59 p. m.',
      detail: 'La entrega representa el 25% del curso. Aún no registras una sesión de revisión.',
      actionLabel: 'Agendar sesión',
      completed: false,
    },
    {
      id: 3,
      kind: 'review',
      priority: 'important',
      title: 'Curso con tendencia descendente',
      courseName: 'Matemáticas Superiores',
      date: 'Revisión recomendada esta semana',
      detail: 'Tu nota bajó 0.8 puntos en dos evaluaciones. Prioriza funciones vectoriales y series.',
      actionLabel: 'Ver notas',
      completed: false,
    },
    {
      id: 4,
      kind: 'evaluation',
      priority: 'suggestion',
      title: 'Quiz de estructuras de datos',
      courseName: 'Algoritmos y Estructuras',
      date: 'Martes · 10:00 a. m.',
      detail: 'Vas 0.5 puntos por encima de tu objetivo. Un repaso de 45 minutos debería ser suficiente.',
      actionLabel: 'Añadir al plan',
      completed: false,
    },
    {
      id: 5,
      kind: 'task',
      priority: 'suggestion',
      title: 'Lectura de paper de redes',
      courseName: 'Redes de Computadoras',
      date: 'Viernes · 23:59',
      detail: 'Resumen de 2 páginas del paper asignado. Puedes hacerlo en una sesión corta.',
      actionLabel: 'Marcar como leído',
      completed: true,
    },
  ]);

  readonly courses = signal<Course[]>([
    { id: 1, name: 'Matemáticas Superiores', code: 'MAT-301', shortName: 'MS', credits: 4, average: 14.2, previousAverage: 15.0, teacher: 'Ing. Rosa Quispe' },
    { id: 2, name: 'Algoritmos y Estructuras', code: 'SIS-210', shortName: 'AE', credits: 4, average: 17.5, previousAverage: 17.0, teacher: 'Mg. Luis Huamán' },
    { id: 3, name: 'Bases de Datos', code: 'SIS-220', shortName: 'BD', credits: 3, average: 16.1, previousAverage: 15.8, teacher: 'Ing. Ana Cerrón' },
    { id: 4, name: 'Sistemas Operativos', code: 'SIS-230', shortName: 'SO', credits: 4, average: 13.8, previousAverage: 14.5, teacher: 'Dr. Pedro Vargas' },
    { id: 5, name: 'Redes de Computadoras', code: 'SIS-240', shortName: 'RC', credits: 3, average: 15.9, previousAverage: 15.5, teacher: 'Ing. María Torres' },
    { id: 6, name: 'Ingeniería de Software', code: 'SIS-250', shortName: 'IS', credits: 4, average: 16.4, previousAverage: 16.0, teacher: 'Mg. Javier Ríos' },
  ]);

  readonly grades = signal<Grade[]>([
    { id: 1, courseId: 1, name: 'Práctica 1', score: 15, weight: 15, date: '2026-09-12', type: 'assignment' },
    { id: 2, courseId: 1, name: 'Parcial 1', score: 13, weight: 25, date: '2026-10-05', type: 'exam' },
    { id: 3, courseId: 1, name: 'Práctica 2', score: 14, weight: 15, date: '2026-10-20', type: 'assignment' },
    { id: 4, courseId: 2, name: 'Quiz 1', score: 18, weight: 10, date: '2026-09-18', type: 'quiz' },
    { id: 5, courseId: 2, name: 'Proyecto parcial', score: 17, weight: 30, date: '2026-10-15', type: 'project' },
    { id: 6, courseId: 4, name: 'Laboratorio 1', score: 14, weight: 20, date: '2026-09-25', type: 'assignment' },
    { id: 7, courseId: 4, name: 'Parcial 1', score: 13, weight: 30, date: '2026-10-10', type: 'exam' },
  ]);

  private sessionsSignal = signal<StudySession[]>([
    {
      id: 1,
      courseId: 4,
      courseName: 'Sistemas Operativos',
      title: 'Repaso de procesos y threads',
      description: 'Repasar capítulos 3 y 4 del Silberschatz. Hacer ejercicios de sincronización.',
      date: '2026-11-12',
      startTime: '07:00',
      durationMinutes: 90,
      status: 'pending',
    },
    {
      id: 2,
      courseId: 1,
      courseName: 'Matemáticas Superiores',
      title: 'Series y transformadas',
      description: 'Practicar problemas de series de Fourier y Laplace.',
      date: '2026-11-12',
      startTime: '16:00',
      durationMinutes: 60,
      status: 'pending',
    },
    {
      id: 3,
      courseId: 3,
      courseName: 'Bases de Datos',
      title: 'Revisión del modelo ER del proyecto',
      description: 'Validar normalización y relaciones antes de la entrega.',
      date: '2026-11-13',
      startTime: '19:00',
      durationMinutes: 45,
      status: 'pending',
    },
    {
      id: 4,
      courseId: 2,
      courseName: 'Algoritmos y Estructuras',
      title: 'Árboles AVL y heaps',
      description: 'Implementar inserción y balanceo en pseudocódigo.',
      date: '2026-11-10',
      startTime: '10:00',
      durationMinutes: 75,
      status: 'completed',
    },
  ]);

  alerts() {
    return this.alertsSignal.asReadonly();
  }

  sessions() {
    return this.sessionsSignal.asReadonly();
  }

  getDashboard(): DashboardData {
    const student = this.student();
    const goal = this.goals()[0];
    const active = this.alertsSignal().filter((a) => !a.completed);
    return {
      studentName: student.firstName,
      currentAverage: 15.8,
      targetAverage: goal.targetValue,
      activeAlerts: active.length,
      pendingMattersToday: 2,
      mainRecommendation: 'Prioriza el repaso de Sistemas Operativos antes del parcial de mañana.',
      recommendationDetail: 'Con 90 minutos de estudio enfocado en procesos y sincronización puedes subir tu proyección del curso.',
      academicGoal: goal,
      priorityAlerts: active.slice(0, 3),
    };
  }

  getPerformance(): AcademicPerformance {
    return {
      generalAverage: 15.8,
      targetAverage: 17.0,
      initialAverage: 14.6,
      weeklyHistory: [
        { week: 'Sem 1', average: 14.6, goal: 17 },
        { week: 'Sem 2', average: 15.0, goal: 17 },
        { week: 'Sem 3', average: 15.3, goal: 17 },
        { week: 'Sem 4', average: 15.1, goal: 17 },
        { week: 'Sem 5', average: 15.6, goal: 17 },
        { week: 'Sem 6', average: 15.8, goal: 17 },
      ],
      courses: this.courses().map((c) => ({
        courseId: c.id,
        courseName: c.name,
        average: c.average,
        change: +(c.average - c.previousAverage).toFixed(1),
        progressPercentage: Math.min(100, Math.round((c.average / 20) * 100)),
      })),
    };
  }

  markAlertCompleted(id: number) {
    this.alertsSignal.update((list) =>
      list.map((a) => (a.id === id ? { ...a, completed: true } : a))
    );
  }

  addSession(session: Omit<StudySession, 'id'>) {
    const nextId = Math.max(0, ...this.sessionsSignal().map((s) => s.id)) + 1;
    this.sessionsSignal.update((list) => [...list, { ...session, id: nextId }]);
  }

  updateSession(id: number, patch: Partial<StudySession>) {
    this.sessionsSignal.update((list) =>
      list.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
  }

  updateStudent(patch: Partial<Student>) {
    this.student.update((s) => ({ ...s, ...patch }));
  }

  updateGoal(id: number, patch: Partial<AcademicGoal>) {
    this.goals.update((list) =>
      list.map((g) => (g.id === id ? { ...g, ...patch } : g))
    );
  }

  updateNotifications(settings: NotificationSettings) {
    this.notificationSettings.set(settings);
  }
}
