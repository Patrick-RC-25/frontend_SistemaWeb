import { Component, inject, signal, computed, DestroyRef } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin, map, of, switchMap } from 'rxjs';
import { form, FormField, required, minLength, min, max } from '@angular/forms/signals';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { ProgressBar } from '../../../../shared/components/progress-bar/progress-bar';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';
import { CoursesService, PeriodoApi } from '../../services/courses.service';
import { Course } from '../../interfaces/course.interface';
import { Grade } from '../../interfaces/grade.interface';
import { getApiErrorMessage } from '../../../../core/api/api-error';

interface CursoFormModelo {
  nombre: string;
  codigo: string;
  docente: string;
  creditos: number;
  notaObjetivo: number;
  color: string;
}

interface PeriodoFormModelo {
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
}

function localDateString(): string {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

interface NotaFormModelo {
  idTipoEvaluacion: string;
  nombre: string;
  ponderacion: number;
  notaMaxima: number;
  notaObtenida: number | null;
  fechaEvaluacion: string;
}

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [PageHeader, ProgressBar, EmptyState, LoadingSpinner, DecimalPipe, FormField],
  templateUrl: './courses.html',
  styleUrl: './courses.css',
})
export class Courses {
  private readonly coursesService = inject(CoursesService);
  private readonly destroyRef = inject(DestroyRef);

  readonly courses = signal<Course[]>([]);
  readonly periods = signal<PeriodoApi[]>([]);
  readonly activePeriod = computed(() => this.periods().find((period) => period.estado === 'activo') ?? null);
  readonly showPeriodForm = signal(false);
  readonly savingPeriod = signal(false);
  readonly grades = signal<Grade[]>([]);
  readonly selectedId = signal<number | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly loadError = signal<string | null>(null);
  readonly showForm = signal(false);
  readonly editingCourseId = signal<number | null>(null);
  readonly saving = signal(false);
  readonly showGradeForm = signal(false);
  readonly editingGradeId = signal<number | null>(null);
  readonly savingGrade = signal(false);

  readonly selected = computed(() => {
    const id = this.selectedId();
    if (id === null) return null;
    return this.courses().find((course) => course.id === id) ?? null;
  });

  readonly selectedGrades = computed(() => {
    const id = this.selectedId();
    if (id === null) return [];
    return this.grades().filter((grade) => grade.courseId === id);
  });

  private readonly modelo = signal<CursoFormModelo>({
    nombre: '',
    codigo: '',
    docente: '',
    creditos: 3,
    notaObjetivo: 14,
    color: '',
  });

  readonly cursoForm = form(this.modelo, (e) => {
    required(e.nombre, { message: 'El nombre es obligatorio' });
    minLength(e.nombre, 2, { message: 'Mínimo 2 caracteres' });
    min(e.creditos, 1, { message: 'Mínimo 1 crédito' });
    max(e.creditos, 20, { message: 'Máximo 20' });
  });

  private readonly periodoModelo = signal<PeriodoFormModelo>({
    nombre: '', fechaInicio: localDateString(), fechaFin: '',
  });

  readonly periodoForm = form(this.periodoModelo, (schema) => {
    required(schema.nombre, { message: 'El nombre del periodo es obligatorio' });
    minLength(schema.nombre, 2, { message: 'Mínimo 2 caracteres' });
    required(schema.fechaInicio, { message: 'La fecha de inicio es obligatoria' });
    required(schema.fechaFin, { message: 'La fecha de fin es obligatoria' });
  });

  private readonly notaModelo = signal<NotaFormModelo>({
    idTipoEvaluacion: '1',
    nombre: '',
    ponderacion: 20,
    notaMaxima: 20,
    notaObtenida: null,
    fechaEvaluacion: '',
  });

  readonly notaForm = form(this.notaModelo, (e) => {
    required(e.nombre, { message: 'Nombre obligatorio' });
    minLength(e.nombre, 2, { message: 'Mínimo 2 caracteres' });
    min(e.ponderacion, 1, { message: 'Mínimo 1%' });
    max(e.ponderacion, 100, { message: 'Máximo 100%' });
  });

  readonly tiposEvaluacion = [
    { id: '1', nombre: 'Examen' },
    { id: '2', nombre: 'Parcial' },
    { id: '3', nombre: 'Práctica' },
    { id: '4', nombre: 'Trabajo' },
    { id: '5', nombre: 'Proyecto' },
    { id: '6', nombre: 'Otros' },
  ];

  constructor() {
    this.recargar();
  }

  recargar(): void {
    this.loading.set(true);
    this.error.set(null);
    this.loadError.set(null);
    forkJoin({ courses: this.coursesService.getCourses(), periods: this.coursesService.getPeriodos() }).pipe(
      switchMap(({ courses, periods }) => courses.length
        ? this.coursesService.getGrades().pipe(map((grades) => ({ courses, periods, grades })))
        : of({ courses, periods, grades: [] as Grade[] })),
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.loading.set(false)),
    ).subscribe({
      next: ({ courses, periods, grades }) => {
        this.courses.set(courses);
        this.periods.set(periods);
        this.grades.set(grades);
        if (this.selectedId() !== null && !courses.some((course) => course.id === this.selectedId())) {
          this.selectedId.set(null);
        }
      },
      error: (error: unknown) => this.loadError.set(getApiErrorMessage(error)),
    });
  }

  abrirPeriodo(): void {
    const start = localDateString();
    this.periodoModelo.set({ nombre: '', fechaInicio: start, fechaFin: '' });
    this.showPeriodForm.set(true);
  }

  guardarPeriodo(event: Event): void {
    event.preventDefault();
    if (this.periodoForm().invalid()) {
      this.periodoForm.nombre().markAsTouched();
      this.periodoForm.fechaInicio().markAsTouched();
      this.periodoForm.fechaFin().markAsTouched();
      return;
    }
    const model = this.periodoModelo();
    if (model.fechaFin < model.fechaInicio) {
      this.error.set('La fecha de fin no puede ser anterior a la fecha de inicio.');
      return;
    }
    this.savingPeriod.set(true);
    this.error.set(null);
    this.coursesService.crearPeriodo({
      nombre: model.nombre.trim(),
      fecha_inicio: model.fechaInicio,
      fecha_fin: model.fechaFin,
    }).pipe(finalize(() => this.savingPeriod.set(false))).subscribe({
      next: () => {
        this.showPeriodForm.set(false);
        this.selectedId.set(null);
        this.recargar();
      },
      error: (error: unknown) => this.error.set(getApiErrorMessage(error)),
    });
  }

  select(course: Course): void {
    this.selectedId.set(this.selectedId() === course.id ? null : course.id);
    this.showGradeForm.set(false);
  }

  openForm(): void {
    this.editingCourseId.set(null);
    this.modelo.set({ nombre: '', codigo: '', docente: '', creditos: 3, notaObjetivo: 14, color: '' });
    this.showForm.set(true);
  }

  guardarCurso(ev: Event): void {
    ev.preventDefault();
    if (this.cursoForm().invalid()) {
      this.cursoForm.nombre().markAsTouched();
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    const m = this.modelo();
    const datos = {
        nombre: m.nombre,
        codigo: m.codigo || undefined,
        docente: m.docente || undefined,
        creditos: Number(m.creditos),
        nota_objetivo: Number(m.notaObjetivo),
        color: m.color || undefined,
      };
    const editingId = this.editingCourseId();
    const request = editingId === null
      ? this.coursesService.crearCurso(datos)
      : this.coursesService.actualizarCurso(editingId, datos);
    request.pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (course) => {
          this.courses.update((list) => editingId === null
            ? [...list, course]
            : list.map((item) => item.id === editingId ? course : item));
          this.showForm.set(false);
          this.editingCourseId.set(null);
        },
        error: (error: unknown) => this.error.set(getApiErrorMessage(error)),
      });
  }


  editCourse(course: Course): void {
    this.editingCourseId.set(course.id);
    this.modelo.set({
      nombre: course.name,
      codigo: course.code,
      docente: course.teacher ?? '',
      creditos: course.credits || 3,
      notaObjetivo: course.targetAverage ?? 14,
      color: course.color ?? '',
    });
    this.showForm.set(true);
  }

  deleteCourse(course: Course): void {
    if (!confirm(`¿Desactivar el curso «${course.name}»?`)) return;
    this.coursesService.eliminarCurso(course.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.courses.update((items) => items.filter((item) => item.id !== course.id));
        if (this.selectedId() === course.id) this.selectedId.set(null);
      },
      error: (error: unknown) => this.error.set(getApiErrorMessage(error)),
    });
  }

  openGradeForm(): void {
    if (this.selectedId() == null) return;
    this.editingGradeId.set(null);
    this.notaModelo.set({ idTipoEvaluacion: '1', nombre: '', ponderacion: 20, notaMaxima: 20, notaObtenida: null, fechaEvaluacion: '' });
    this.showGradeForm.set(true);
  }


  editGrade(grade: Grade): void {
    this.editingGradeId.set(grade.id);
    this.notaModelo.set({
      idTipoEvaluacion: String(grade.typeId),
      nombre: grade.name,
      ponderacion: grade.weight,
      notaMaxima: 20,
      notaObtenida: grade.score,
      fechaEvaluacion: grade.date,
    });
    this.showGradeForm.set(true);
  }

  deleteGrade(grade: Grade): void {
    if (!confirm(`¿Eliminar la evaluación «${grade.name}»?`)) return;
    this.coursesService.eliminarEvaluacion(grade.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.grades.update((items) => items.filter((item) => item.id !== grade.id));
        this.coursesService.getCourses().subscribe({
          next: (courses) => this.courses.set(courses),
          error: () => undefined,
        });
      },
      error: (error: unknown) => this.error.set(getApiErrorMessage(error)),
    });
  }

  guardarNota(ev: Event): void {
    ev.preventDefault();
    const idCurso = this.selectedId();
    if (idCurso == null) return;
    if (this.notaForm().invalid()) {
      this.notaForm.nombre().markAsTouched();
      return;
    }
    this.savingGrade.set(true);
    this.error.set(null);
    const m = this.notaModelo();
    const nota = m.notaObtenida === null ? null : Number(m.notaObtenida);
    const editingIdForWeight = this.editingGradeId();
    const existingWeight = this.selectedGrades()
      .filter((grade) => grade.id !== editingIdForWeight)
      .reduce((total, grade) => total + grade.weight, 0);
    if (existingWeight + Number(m.ponderacion) > 100.0001) {
      this.error.set(`La ponderación total superaría el 100 % (actual: ${existingWeight} %).`);
      this.savingGrade.set(false);
      return;
    }
    if (nota !== null && (nota < 0 || nota > 20)) {
      this.error.set('La nota obtenida debe estar entre 0 y la nota máxima.');
      this.savingGrade.set(false);
      return;
    }
    const payload = {
      id_curso: idCurso,
      id_tipo_evaluacion: Number(m.idTipoEvaluacion),
      nombre: m.nombre.trim(),
      ponderacion: Number(m.ponderacion),
      nota_maxima: 20,
      nota_obtenida: nota !== null && Number.isFinite(nota) ? nota : null,
      fecha_evaluacion: m.fechaEvaluacion || null,
    };
    const editingId = this.editingGradeId();
    const request = editingId === null
      ? this.coursesService.crearEvaluacion(payload)
      : this.coursesService.actualizarEvaluacion(editingId, payload);
    request.pipe(finalize(() => this.savingGrade.set(false))).subscribe({
      next: (grade) => {
        this.grades.update((list) => editingId === null
          ? [...list, grade]
          : list.map((item) => item.id === editingId ? grade : item));
        this.showGradeForm.set(false);
        this.editingGradeId.set(null);
        this.coursesService.getCourses().subscribe({
          next: (courses) => this.courses.set(courses),
          error: () => undefined,
        });
      },
      error: (error: unknown) => this.error.set(getApiErrorMessage(error)),
    });
  }

}
