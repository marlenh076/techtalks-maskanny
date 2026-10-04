export interface User {
  user_id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  role: "user" | "admin";
  created_at: string;
}

export type UserProfileUpdate = Partial<
  Pick<User, "firstname" | "lastname" | "phone">
>;
