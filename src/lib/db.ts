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
  //   userCars: {
  //     async all() {
  //       const { data } = await supabase.from('cars').select('*').order('position');

  //       return data;
  //     },

  //     async get(id: string) {
  //       const { data } = await supabase
  //         .from('cars')
  //         .select('id, title, lists ( id, title, position, cards ( id, description, position ))')
  //         .eq('id', id)
  //         .order('position')
  //         .order('position', { foreignTable: 'lists' })
  //         .order('position', { foreignTable: 'lists.cards' })
  //         .single();

  //       return data;
  //     },

  //     async create(car: UserCar) {
  //       const { data } = await supabase.from('cars').insert(car).select().maybeSingle();

  //       return data;
  //     },

  //     async update(car: UserCar) {
  //       const { data } = await supabase
  //         .from('cars')
  //         .update({ title: car.model })
  //         .match({ id: car.id })
  //         .select()
  //         .maybeSingle();

  //       return data;
  //     },

  //     async sort(car: UserCar) {
  //       const { data } = await supabase.rpc('sort_board', {
  //         board_id: car.id,
  //         list_ids: car.model.map((list) => list.id),
  //       });

  //       return data;
  //     },
  //   },

  ownedCarList: {
    async all() {
      const { data } = await supabase.from('ownedCarList').select();
      console.log(data);
      return data;
    },
    async create() {
      const { data } = await supabase
        .from('ownedCarList')
        .insert({ user_id, carsOwned: [], id: user_id, createdAt: new Date(), carsWanted: [] })
        .select()
        .maybeSingle();

      return data;
    },
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
    async all() {
      const { data } = await supabase.from('wantedCarList').select();
      console.log(data);
      return data;
    },
    async create() {
      const { data } = await supabase
        .from('wantedCarList')
        .insert({ user_id, carsOwned: [], id: user_id, createdAt: new Date(), carsWanted: [] })
        .select()
        .maybeSingle();

      return data;
    },
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
