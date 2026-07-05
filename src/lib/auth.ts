import { writable } from 'svelte/store';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { auth } from './firebase';

// undefined = session not yet resolved, null = signed out, User = signed in
export const user = writable<User | null | undefined>(undefined);

onAuthStateChanged(auth, (firebaseUser) => {
  user.set(firebaseUser);
});

export async function signIn(
  email: string,
  password: string,
): Promise<{ error: { message: string } | null }> {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return { error: null };
  } catch (err) {
    // Firebase error messages read like "Firebase: Error (auth/invalid-credential)."
    // -- strip the noise down to something a human can act on in a toast.
    const message =
      err instanceof Error && !err.message.includes('auth/')
        ? err.message.replace(/^Firebase: /, '')
        : 'Invalid login credentials';
    return { error: { message } };
  }
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}
