import { Injectable, inject } from '@angular/core';
import { MockDataService } from '../../../core/services/mock-data.service';
import { Course } from '../interfaces/course.interface';
import { Grade } from '../interfaces/grade.interface';

@Injectable({ providedIn: 'root' })
export class CoursesService {
  private readonly mock = inject(MockDataService);

  getCourses(): Course[] {
    return this.mock.courses();
  }

  getGrades(): Grade[] {
    return this.mock.grades();
  }

  getGradesByCourse(courseId: number): Grade[] {
    return this.getGrades().filter((grade) => grade.courseId === courseId);
  }
}
