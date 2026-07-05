import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase web config is public by design (it ships to every browser);
// access control lives entirely in Firestore/Storage security rules.
const firebaseConfig = {
  apiKey: 'AIzaSyBDPC4JJ2bifuOFNHmbfsqtLbpTddz4bEo',
  authDomain: 'sdotlabs-2.firebaseapp.com',
  projectId: 'sdotlabs-2',
  // Not the auto-provisioned default bucket ("sdotlabs-2.firebasestorage.app")
  // -- that one predates a Blaze->Spark downgrade and is stuck read-only, so
  // uploads go to this manually created bucket instead.
  storageBucket: 'sdotlabs-2',
  messagingSenderId: '764390757591',
  appId: '1:764390757591:web:c74bf6c6eecc22ceb78c92',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const STORAGE_BUCKET = firebaseConfig.storageBucket;
