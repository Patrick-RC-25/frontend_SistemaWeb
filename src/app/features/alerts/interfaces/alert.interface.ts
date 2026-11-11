export type AlertKind = 'evaluation' | 'task' | 'review';

export type AlertPriority = 'urgent' | 'important' | 'suggestion';

export interface AcademicAlert {
  id: number;
  kind: AlertKind;
  priority: AlertPriority;
  title: string;
  courseName: string;
  date: string;
  detail: string;
  actionLabel: string;
  completed: boolean;
}