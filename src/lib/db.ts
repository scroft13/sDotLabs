import { createClient, type User } from '@supabase/supabase-js';
import { writable } from 'svelte/store';
import type { UserCar } from './shared';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);
const userStore = writable();

let user_id: string | undefined;

supabase.auth.getSession().then(({ data }) => {
  userStore.set(data.session?.user);
  user_id = data.session?.user.id;
});

supabase.auth.onAuthStateChange((event, session) => {
  if (event == 'SIGNED_IN' && session) {
    userStore.set(session.user);
  } else if (event == 'SIGNED_OUT') {
    userStore.set(null);
  }
});

export default {
  get user() {
    return userStore;
  },
  signIn(email: string) {
    return supabase.auth.signInWithOtp({ email });
  },
  signOut() {
    return supabase.auth.signOut();
  },
  createUser: {
    async all() {
      const { data } = await supabase.from('userInfo').select();
      return data;
    },
    async create() {
      const { data } = await supabase
        .from('userInfo')
        .insert({ user_id, wantedCarList: [], ownedCarList: [] })
        .select()
        .maybeSingle();

      return data;
    },
  },
  ownedCarList: {
    // async all() {
    //   const { data } = await supabase.from('ownedCarList').select();
    //   return data;
    // },
    async update(carList: UserCar[]) {
      user_id
        ? await supabase
            .from('userInfo')
            .update({
              ownedCarList: [...carList],
            })
            .eq('user_id', user_id)
        : null;
    },
  },
  wantedCarList: {
    async update(carList: UserCar[]) {
      user_id
        ? await supabase
            .from('userInfo')
            .update({
              wantedCarList: [...carList],
            })
            .eq('user_id', user_id)
        : null;
    },
  },
};
