'use client';

import { useEffect, useState } from 'react';

import { apiFetch } from '../../lib/api';

type SessionState = {
  readonly checked: boolean;
  readonly userId: string | null;
};

export function useAuthSession() {
  const [state, setState] = useState<SessionState>({ checked: false, userId: null });

  useEffect(() => {
    let active = true;
    void apiFetch<{ data: { id: string } }>('/me')
      .then((response) => {
        if (active) setState({ checked: true, userId: response.data.id });
      })
      .catch(() => {
        if (active) setState({ checked: true, userId: null });
      });
    return () => {
      active = false;
    };
  }, []);

  return state;
}
