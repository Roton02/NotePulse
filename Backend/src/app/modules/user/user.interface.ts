export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}
