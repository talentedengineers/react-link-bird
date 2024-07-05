import { initializeApp } from "firebase/app";
import { initializeAuth, indexedDBLocalPersistence } from "firebase/auth";

import { FIREBASE_OPTIONS } from "./constants.ts";

export const FIREBASE_APP = initializeApp(FIREBASE_OPTIONS);

export const AUTH = initializeAuth(FIREBASE_APP, {
  persistence: indexedDBLocalPersistence,
});
