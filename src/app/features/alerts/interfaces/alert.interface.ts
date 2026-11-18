export type AlertKind = 'reminder' | 'task' | 'review' | 'system';

export interface AcademicAlert {
  id: number;
  kind: AlertKind;
  kindLabel: string;
  title: string;
  courseName: string;
  date: string;
  detail: string;
  actionLabel: string;
  read: boolean;
}
