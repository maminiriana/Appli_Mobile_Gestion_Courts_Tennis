import { Database } from './supabase.types';

// Types pour les utilisateurs
export type User = Database['public']['Tables']['users']['Row'];
export type ProfileImage = Database['public']['Tables']['profile_images']['Row'];

// Type pour le contexte d'authentification
export type AuthContextType = {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
};

// Type pour le formulaire d'inscription
export type RegisterFormData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  subscription_status: boolean;
  last_subscription_date: string | null;
  role: string;
  profileImage: string | null;
};
