export interface CourseSchedule {
  id: number;
  courseId: number;
  courseName: string;
  day: number;
  startTime: string;
  endTime: string;
  classroom: string;
}

export interface ScheduleFormModel {
  courseId: string;
  day: string;
  startTime: string;
  endTime: string;
  classroom: string;
}
