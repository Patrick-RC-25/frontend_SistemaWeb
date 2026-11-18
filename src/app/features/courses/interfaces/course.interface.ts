export interface Course {
  id: number;
  name: string;
  code: string;
  shortName: string;
  credits: number;
  average: number | null;
  targetAverage: number | null;
  teacher?: string;
  color?: string;
}
