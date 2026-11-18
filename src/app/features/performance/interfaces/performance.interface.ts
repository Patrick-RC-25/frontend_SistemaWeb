export interface CoursePerformance {
  courseId: number;
  courseName: string;
  average: number | null;
  targetAverage: number | null;
  difference: number | null;
  progressPercentage: number;
}

export interface AcademicPerformance {
  generalAverage: number | null;
  coursesBelowTarget: string[];
  recommendations: string[];
  courses: CoursePerformance[];
}
