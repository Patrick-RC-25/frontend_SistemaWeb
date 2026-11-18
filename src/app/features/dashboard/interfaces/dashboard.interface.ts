import { AcademicAlert } from '../../alerts/interfaces/alert.interface';
import { AcademicGoal } from '../../profile/interfaces/academic-goal.interface';

export interface DashboardData {
  studentName: string;
  currentAverage: number | null;
  targetAverage: number | null;
  activeAlerts: number;
  pendingActivities: number;
  mainRecommendation: string;
  recommendationDetail: string;
  academicGoal: AcademicGoal;
  priorityAlerts: AcademicAlert[];
}
