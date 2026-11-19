import { UserRole } from "../user/user.interface";

export interface IRegisterPayload {
  name: string;
  email: string;
  password: string;
  interests?: string[];
}

export interface ILoginPayload {
  email: string;
  password: string;
}

// Claims stored inside the JWT and read back by the auth middleware
export interface IAuthTokenPayload {
  id: string;
  role: UserRole;
}
