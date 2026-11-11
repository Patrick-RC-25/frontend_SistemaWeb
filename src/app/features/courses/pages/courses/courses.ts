import { Component, inject, signal, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { ProgressBar } from '../../../../shared/components/progress-bar/progress-bar';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { CoursesService } from '../../services/courses.service';
import { Course } from '../../interfaces/course.interface';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [PageHeader, ProgressBar, EmptyState, DecimalPipe],
  templateUrl: './courses.html',
  styleUrl: './courses.css',
})
export class Courses {
  private readonly coursesService = inject(CoursesService);

  readonly courses = signal(this.coursesService.getCourses());
  readonly grades = signal(this.coursesService.getGrades());
  readonly selectedId = signal<number | null>(null);

  readonly selected = computed(() => {
    const id = this.selectedId();
    if (id === null) return null;
    return this.courses().find((course) => course.id === id) ?? null;
  });

  readonly selectedGrades = computed(() => {
    const id = this.selectedId();
    return id === null ? [] : this.coursesService.getGradesByCourse(id);
  });

  select(course: Course): void {
    this.selectedId.set(this.selectedId() === course.id ? null : course.id);
  }

  changeLabel(course: Course): string {
    const difference = course.average - course.previousAverage;
    if (difference > 0) return `+${difference.toFixed(1)}`;
    if (difference < 0) return difference.toFixed(1);
    return '0.0';
  }

  changeTone(course: Course): 'success' | 'danger' | 'default' {
    const difference = course.average - course.previousAverage;
    if (difference > 0) return 'success';
    if (difference < 0) return 'danger';
    return 'default';
  }
}
