export interface Course {
  id: number;
  name: string;
  code: string;
  shortName: string;
  credits: number;
  average: number;
  previousAverage: number;
  teacher?: string;
}