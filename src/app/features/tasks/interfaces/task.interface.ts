export type TaskPriority = 'baja' | 'media' | 'alta';
export type TaskStatus = 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';

export interface AcademicTask {
  id: number;
  courseId: number | null;
  objectiveId: number | null;
  objectiveTitle: string;
  courseName: string;
  title: string;
  description: string;
  dueDate: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  completedAt: string | null;
}
