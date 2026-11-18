export interface Grade {
  id: number;
  courseId: number;
  name: string;
  score: number | null;
  maxScore: number;
  weight: number;
  date: string;
  type: string;
  typeId: number;
  typeLabel: string;
}
