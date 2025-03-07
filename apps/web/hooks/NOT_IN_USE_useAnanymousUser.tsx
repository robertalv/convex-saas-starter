"use client";

import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useMutation } from 'convex/react';
import type { FunctionReference } from 'convex/server';

export interface UseAnonymousUserOptions {
    storageKey?: string;
    heartbeatInterval?: number;
}

export function useAnonymousUser(
    trackSessionMutation: FunctionReference<"mutation">,
    options: UseAnonymousUserOptions = {}
): string | null {
    const {
        storageKey = 'anonymousUserId',
        heartbeatInterval = 5 * 60 * 1000 // 5 minutes
    } = options;

    const [anonymousId, setAnonymousId] = useState<string | null>(null);
    const trackSession = useMutation(trackSessionMutation);

    useEffect(() => {
        // Only run on client side
        if (typeof window === 'undefined') return;

        // Get existing ID or create a new one
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
    }, [trackSession, storageKey, heartbeatInterval]);

    return anonymousId;
}