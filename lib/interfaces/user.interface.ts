export interface UserType {
  _id: string;
  email: string;
  role: UserRolesType;
}

export type UserRolesType = "admin" | "user";
