import { useEffect, useState } from "react";
import { User, getAuth } from "firebase/auth";
import { FIREBASE_APP } from "../firebase";

const auth = getAuth(FIREBASE_APP);

export function useAuth() {
  const [isLoading, setIsLoading] = useState(true);

  const [user, setUser] = useState(auth.currentUser as User | null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user: User | null) => {
      setIsLoading(false);
      setUser(user);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    isLoading,
    user,
  };
}
