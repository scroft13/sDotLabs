import { writable } from 'svelte/store';
import type { AuthError, User } from '@supabase/supabase-js';
import { supabase } from './db';

// undefined = session not yet resolved, null = signed out, User = signed in
export const user = writable<User | null | undefined>(undefined);

supabase.auth.getSession().then(({ data }) => {
  user.set(data.session?.user ?? null);
});

supabase.auth.onAuthStateChange((_event, session) => {
  user.set(session?.user ?? null);
});

export async function signIn(
  email: string,
  password: string,
): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error };
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}
