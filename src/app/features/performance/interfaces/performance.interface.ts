export interface WeeklyPerformance {
  week: string;
  average: number;
  goal: number;
}

export interface CoursePerformance {
  courseId: number;
  courseName: string;
  average: number;
  change: number;
  progressPercentage: number;
}

export interface AcademicPerformance {
  generalAverage: number;
  targetAverage: number;
  initialAverage: number;
  weeklyHistory: WeeklyPerformance[];
  courses: CoursePerformance[];
}