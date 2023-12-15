export interface UserType {
  id: string;
  email: string;
  role: UserRolesType;
}

export type UserRolesType = "admin" | "user";
