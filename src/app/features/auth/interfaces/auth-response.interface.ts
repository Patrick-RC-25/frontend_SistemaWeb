import { Student } from '../../profile/interfaces/student.interface';

export interface AuthResponse {
  authenticated: boolean;
  student: Student;
}