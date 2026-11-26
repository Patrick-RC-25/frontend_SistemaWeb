export interface TaskFormModel {
  courseId: string;
  objectiveId: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'baja' | 'media' | 'alta';
}
