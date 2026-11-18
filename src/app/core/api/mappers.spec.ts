import { toCourse, buildShortName } from '../../features/courses/mappers/course.mapper';
import { toGrade } from '../../features/courses/mappers/grade.mapper';
import { toAlert } from '../../features/alerts/mappers/alert.mapper';
import { toStudySession } from '../../features/planner/mappers/session.mapper';
import { toPerformance } from '../../features/performance/mappers/performance.mapper';
import { toAuthResponse } from '../../features/auth/mappers/auth.mapper';

describe('API mappers', () => {
  it('derives a course short name without connectors', () => {
    expect(buildShortName('Algoritmos y Estructuras')).toBe('AE');
    expect(buildShortName('Bases de Datos')).toBe('BD');
  });

  it('maps a course using the SQL Server API fields', () => {
    const course = toCourse({
      id_curso: 4,
      id_periodo: 2,
      nombre: 'Sistemas Operativos',
      codigo: 'SIS-230',
      docente: 'Dr. Pedro Vargas',
      creditos: 4,
      color: null,
      nota_objetivo: 16,
      estado: true,
      promedio_actual: null,
    });

    expect(course.name).toBe('Sistemas Operativos');
    expect(course.shortName).toBe('SO');
    expect(course.average).toBeNull();
    expect(course.targetAverage).toBe(16);
    expect(course.teacher).toBe('Dr. Pedro Vargas');
  });

  it('keeps an ungraded evaluation as pending instead of converting it to zero', () => {
    const grade = toGrade({
      id_evaluacion: 2,
      id_curso: 1,
      id_tipo_evaluacion: 2,
      nombre: 'Parcial 1',
      ponderacion: 25,
      nota_maxima: 20,
      nota_obtenida: null,
      fecha_evaluacion: null,
    });

    expect(grade.courseId).toBe(1);
    expect(grade.score).toBeNull();
    expect(grade.typeLabel).toBe('Parcial');
  });

  it('maps alert types to the correct alert meaning and read state', () => {
    const alert = toAlert({
      id_alerta: 1,
      id_usuario: 7,
      id_curso: 3,
      id_tarea: null,
      id_tipo_alerta: 2,
      titulo: 'Entrega de práctica',
      mensaje: 'La práctica vence mañana',
      fecha_programada: null,
      leida: false,
    });

    expect(alert.kind).toBe('task');
    expect(alert.kindLabel).toBe('Vencimiento');
    expect(alert.read).toBe(false);
  });

  it('maps a study session and its in-progress state', () => {
    const session = toStudySession({
      id_sesion: 1,
      id_usuario: 7,
      id_curso: 4,
      id_tarea: null,
      titulo: 'Repaso',
      fecha_inicio_programada: '2026-11-12T07:00:00',
      fecha_fin_programada: '2026-11-12T08:30:00',
      fecha_inicio_real: '2026-11-12T07:03:00',
      fecha_fin_real: null,
      estado: 'en_progreso',
      notas: 'Procesos',
    }, 'Sistemas Operativos');

    expect(session.courseName).toBe('Sistemas Operativos');
    expect(session.startTime).toBe('07:00');
    expect(session.durationMinutes).toBe(90);
    expect(session.status).toBe('inProgress');
  });

  it('maps the actual performance endpoint without inventing weekly history', () => {
    const performance = toPerformance({
      promedio_general: 15.6,
      cursos: [{
        id_curso: 1,
        nombre: 'Matemáticas Superiores',
        promedio: 14.2,
        nota_objetivo: 16,
        diferencia: -1.8,
      }],
      cursos_bajo_objetivo: ['Matemáticas Superiores'],
      recomendaciones: ['Refuerza Matemáticas Superiores.'],
    });

    expect(performance.generalAverage).toBe(15.6);
    expect(performance.courses[0].difference).toBe(-1.8);
    expect(performance.coursesBelowTarget).toContain('Matemáticas Superiores');
  });

  it('maps the JWT response returned by FastAPI', () => {
    const auth = toAuthResponse({
      access_token: 'token-de-prueba',
      token_type: 'bearer',
      email: 'estudiante@example.com',
      id_usuario: 7,
    });

    expect(auth.authenticated).toBe(true);
    expect(auth.email).toBe('estudiante@example.com');
    expect(auth.idUsuario).toBe(7);
    expect(auth.token).toBe('token-de-prueba');
  });
});
