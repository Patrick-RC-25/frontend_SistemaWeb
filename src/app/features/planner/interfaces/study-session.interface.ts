export type StudySessionStatus = 'pending' | 'completed' | 'cancelled';

export interface StudySession {
  id: number;
  courseId: number;
  courseName: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  status: StudySessionStatus;
}