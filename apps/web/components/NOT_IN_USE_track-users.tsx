"use client";

import { api } from "@workspace/backend/convex/_generated/api";

import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useMutation } from 'convex/react';

const TrackUsers = () => {
  const [anonymousId, setAnonymousId] = useState<string | null>(null);
  const trackSession = useMutation(api.sessions.trackSession);

  
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Get existing ID or create a new one
    const storageKey = 'anonymousUserId';
    const heartbeatInterval = 5 * 60 * 1000; // 5 minutes

    const storedId = localStorage.getItem(storageKey);
    const id = storedId || uuidv4();

    if (!storedId) {
      localStorage.setItem(storageKey, id);
    }

    setAnonymousId(id);

    // Track this session in Convex
    trackSession({ anonymousId: id });

    // Set up a heartbeat to track active sessions
    const interval = setInterval(() => {
      trackSession({ anonymousId: id });
    }, heartbeatInterval);

    return () => clearInterval(interval);
  }, [trackSession]);

  return <></>;
}

export default TrackUsers;
