import { Database } from './supabase.types';

export type User = Database['public']['Tables']['users']['Row'];

export type AuthContextType = {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
};

export type RegisterFormData = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  subscription_status: boolean;
  last_subscription_date: string | null;
  role: string;
  profile_image: string | null;
};