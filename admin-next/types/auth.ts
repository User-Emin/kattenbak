/**
 * AUTH TYPES - DRY & Backend Compatible
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

