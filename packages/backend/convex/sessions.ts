import { mutation, query, internalMutation, MutationCtx } from "./_generated/server";
import { v } from "convex/values";

export const trackSession = mutation({
    args: { anonymousId: v.string() },
    handler: async (ctx, args) => {
        const { anonymousId } = args;

        // Look up existing session
        const existing = await ctx.db
            .query('sessions')
            .withIndex('by_anonymous_id', (q) => q.eq('anonymousId', anonymousId))
            .first();

        if (existing) {
            // Update last active timestamp
            await ctx.db.patch(existing._id, { lastActive: new Date().toISOString() });
            return existing._id;
        } else {
            // Create new session
            return await ctx.db.insert('sessions', {
                anonymousId,
                createdAt: new Date().toISOString(),
                lastActive: new Date().toISOString(),
                actions: []
            });
        }
    }
});


export const trackUserAction = mutation({
    args: {
        anonymousId: v.string(),
        action: v.string(),
        resourceId: v.optional(v.string()),
        metadata: v.optional(v.any())
    },
    handler: async (ctx, args) => {
        const { anonymousId, action, resourceId, metadata } = args;

        // Find the session
        const session = await ctx.db
            .query('sessions')
            .withIndex('by_anonymous_id', (q) => q.eq('anonymousId', anonymousId))
            .first();

        if (!session) {
            throw new Error('Session not found');
        }

        // Track the action
        await ctx.db.patch(session._id, {
            lastActive: new Date().toISOString(),
            actions: [...session.actions, {
                action,
                timestamp: new Date().toISOString(),
                resourceId,
                metadata
            }]
        });
    }
});

export const getActiveSessions = query({
    args: {
        minutesActive: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { minutesActive = 15 } = args;

        const cutoff = new Date();
        cutoff.setMinutes(cutoff.getMinutes() - minutesActive);

        return await ctx.db
            .query('sessions')
            .filter((q) => q.gt(q.field('lastActive'), cutoff.toISOString()))
            .collect();
    }
});

// Common implementation for session cleanup logic
const cleanupSessionsHandler = async (ctx: MutationCtx, args: { daysInactive: number }) => {
    const { daysInactive = 30 } = args;

    // Calculate the cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysInactive);
    const cutoffTimestamp = cutoffDate.toISOString();

    // Find sessions older than the cutoff date
    const oldSessions = await ctx.db
        .query('sessions')
        .filter((q) => q.lt(q.field('lastActive'), cutoffTimestamp))
        .collect();

    // Delete each old session
    let deletedCount = 0;
    for (const session of oldSessions) {
        await ctx.db.delete(session._id);
        deletedCount++;
    }

    return {
        deletedCount,
        oldestDate: cutoffTimestamp,
    };
};

/**
 * Cleans up old sessions that haven't been active for a specified period of time.
 * This helps prevent the database from growing too large with inactive sessions.
 * 
 * This can be manually triggered via the API.
 */
export const cleanupOldSessions = mutation({
    args: {
        daysInactive: v.optional(v.number()),
    },
    handler: cleanupSessionsHandler
});

/**
 * Internal version of cleanupOldSessions for scheduled cron jobs.
 * Uses the same implementation as the public mutation but exposed as an internal function.
 */
export const cleanupOldSessions_internal = internalMutation({
    args: {
        daysInactive: v.optional(v.number()),
    },
    handler: cleanupSessionsHandler
});
