import { w as writable } from "./index.js";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  "https://zruzsnhrgeffpppcliqf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpydXpzbmhyZ2VmZnBwcGNsaXFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDA1ODgzOTYsImV4cCI6MjAxNjE2NDM5Nn0.E32Q5p61P_31o6iQbbIrXN_DMdnp7wVX-1bC1x7QThM"
);
let user_id;
const userStore = writable();
supabase.auth.getSession().then(({ data }) => {
  userStore.set(data.session?.user);
  user_id = data.session?.user.id;
});
supabase.auth.onAuthStateChange((event, session) => {
  if (event == "SIGNED_IN" && session) {
    userStore.set(session.user);
    user_id = session.user.id;
  } else if (event == "SIGNED_OUT") {
    userStore.set(null);
  }
});
const db = {
  get user() {
    return userStore;
  },
  signIn(email) {
    return supabase.auth.signInWithOtp({ email });
  },
  signOut() {
    return supabase.auth.signOut();
  },
  createUser: {
    async create() {
      const { data } = await supabase.from("userInfo").insert({ user_id, wantedCarList: [], ownedCarList: [] }).select().maybeSingle();
      return data;
    }
  },
  ownedCarList: {
    // async all() {
    //   const { data } = await supabase.from('ownedCarList').select();
    //   return data;
    // },
    async update(carList) {
      user_id ? await supabase.from("userCarList").update({
        cars: [...carList]
      }).eq("user_id", user_id) : null;
    }
  },
  wantedCarList: {
    async update(carList) {
      user_id ? await supabase.from("userCarList").update({
        cars: [...carList]
      }).eq("user_id", user_id) : null;
    }
  }
};
let carWantedListStore = writable();
let localStorageWantedCarList;
if (typeof localStorage !== "undefined") {
  localStorageWantedCarList = localStorage.getItem("carList");
}
if (localStorageWantedCarList != "undefined" && localStorageWantedCarList != null) {
  const storedCarWantedList = JSON.parse(localStorageWantedCarList) ?? [];
  carWantedListStore = writable(storedCarWantedList);
}
if (typeof localStorage !== "undefined") {
  carWantedListStore.subscribe((value) => {
    localStorage.carList = JSON.stringify(value);
    db.wantedCarList.update(value);
  });
}
const toasts = writable([]);
export {
  carWantedListStore as c,
  toasts as t
};
