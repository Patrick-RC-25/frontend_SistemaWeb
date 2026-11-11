import { AcademicAlert } from '../../alerts/interfaces/alert.interface';
import { AcademicGoal } from '../../profile/interfaces/academic-goal.interface';

export interface DashboardData {
  studentName: string;
  currentAverage: number;
  targetAverage: number;
  activeAlerts: number;
  pendingMattersToday: number;
  mainRecommendation: string;
  recommendationDetail: string;
  academicGoal: AcademicGoal;
  priorityAlerts: AcademicAlert[];
}