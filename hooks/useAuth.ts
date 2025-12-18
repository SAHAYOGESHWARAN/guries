import { useState, useEffect } from 'react';
import type { User } from '../types';

// Lightweight auth hook: tries to read `currentUser` from window.__APP_AUTH__ or localStorage
// Falls back to a safe guest user. Replace with real auth integration when available.
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      // Allow an app-level global override for testing
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const globalAny: any = window as any;
      if (globalAny.__APP_AUTH__ && typeof globalAny.__APP_AUTH__ === 'object') {
        setUser(globalAny.__APP_AUTH__ as User);
        return;
      }

      const stored = localStorage.getItem('currentUser');
      if (stored) {
        setUser(JSON.parse(stored) as User);
        return;
      }
    } catch (e) {
      // ignore
    }

    // default guest user
    setUser({ id: 1, name: 'Guest', role: 'user' } as User);
  }, []);

  return { user };
}

export default useAuth;
