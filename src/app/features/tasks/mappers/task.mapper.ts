import { TareaApi } from '../interfaces/tarea-api.interface';
import { AcademicTask } from '../interfaces/task.interface';

export function toAcademicTask(tarea: TareaApi, courseName = ''): AcademicTask {
  return {
    id: tarea.id_tarea,
    courseId: tarea.id_curso,
    courseName,
    title: tarea.titulo,
    description: tarea.descripcion ?? '',
    dueDate: tarea.fecha_vencimiento,
    priority: tarea.prioridad,
    status: tarea.estado,
    completedAt: tarea.fecha_completada,
  };
}
