export interface Grade {
  id: number;
  courseId: number;
  name: string;
  score: number;
  weight: number;
  date: string;
  type: 'exam' | 'assignment' | 'quiz' | 'project';
}