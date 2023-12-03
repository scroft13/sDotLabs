import { createClient } from '@supabase/supabase-js';
import { writable } from 'svelte/store';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);
let user_id: string | undefined;
const userStore = writable();

supabase.auth.getSession().then(({ data }) => {
  userStore.set(data.session?.user);
  user_id = data.session?.user.id;
});

supabase.auth.onAuthStateChange((event, session) => {
  if (event == 'SIGNED_IN' && session) {
    userStore.set(session.user);
    user_id = session.user.id;
  } else if (event == 'SIGNED_OUT') {
    userStore.set(null);
  }
});
export type UserCar = {
  id: string;
  model: string;
  make: string;
  price: number;
};
export type UserInfo = {
  created_at: string;
  id: string;
  user_id: string;
  carsOwned: UserCar[];
  carsWanted: UserCar[];
};
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
            .from('userCarList')
            .update({
              cars: [...carList],
            })
            .eq('user_id', user_id)
        : null;
    },
  },
  wantedCarList: {
    async update(carList: UserCar[]) {
      user_id
        ? await supabase
            .from('userCarList')
            .update({
              cars: [...carList],
            })
            .eq('user_id', user_id)
        : null;
    },
  },
};
