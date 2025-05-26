import { supabase } from '@/lib/supabase';

export async function testConnection() {
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    
    if (error) {
      console.error('Erreur de connexion à Supabase:', error.message);
      return false;
    }
    
    console.log('Connexion à Supabase réussie!');
    return true;
  } catch (error) {
    console.error('Erreur inattendue:', error);
    return false;
  }
}