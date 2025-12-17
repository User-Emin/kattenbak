export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  createdAt?: Date;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
