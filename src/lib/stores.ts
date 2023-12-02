import { writable } from 'svelte/store';
import type { UserCar } from './db';
import db from './db';

export let carWantedListStore = writable<UserCar[]>();

let localStorageWantedCarList;

if (typeof localStorage !== 'undefined') {
  localStorageWantedCarList = localStorage.getItem('carList');
}

if (localStorageWantedCarList != 'undefined' && localStorageWantedCarList != null) {
  const storedCarWantedList: UserCar[] = JSON.parse(localStorageWantedCarList) ?? [];
  carWantedListStore = writable(storedCarWantedList);
}

if (typeof localStorage !== 'undefined') {
  carWantedListStore.subscribe((value) => {
    localStorage.carList = JSON.stringify(value);
    db.wantedCarList.update(value);
  });
}
