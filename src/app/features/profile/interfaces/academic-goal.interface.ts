export interface AcademicGoal {
  id: number;
  title: string;
  currentValue: number;
  targetValue: number;
  progressPercentage: number;
  totalTasks: number;
  completedTasks: number;
  description?: string;
  courseId: number | null;
  startDate: string;
  limitDate: string | null;
  status: 'pendiente' | 'en_progreso' | 'completado' | 'cancelado';
}
