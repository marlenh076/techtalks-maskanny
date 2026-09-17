export enum UserRole {
  STUDENT = "student",
  HOST = "host",
}

export interface User {
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  role: UserRole;
  created_at: string;
}
