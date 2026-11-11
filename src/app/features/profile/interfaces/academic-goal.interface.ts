export interface AcademicGoal {
  id: number;
  title: string;
  currentValue: number;
  targetValue: number;
  progressPercentage: number;
  description?: string;
}