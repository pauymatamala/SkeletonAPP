export interface User {
  id?: number;
  email: string;
  displayName?: string;
  avatar?: string;
  role?: 'admin' | 'user';
}
