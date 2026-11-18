export interface TaskFormModel {
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'baja' | 'media' | 'alta';
}
