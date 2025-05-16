import { Database } from '@supabase/supabase-js';

export type PublicSchema = Database['public'];
export type Tables = PublicSchema['Tables'];
export type UsersTable = Tables['users'];
export type ProfileImagesTable = Tables['profile_images'];
