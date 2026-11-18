export type StudySessionStatus = 'pending' | 'inProgress' | 'completed' | 'cancelled';

export interface StudySession {
  id: number;
  courseId: number | null;
  courseName: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  status: StudySessionStatus;
}
