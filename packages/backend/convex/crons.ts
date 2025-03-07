// https://docs.convex.dev/scheduling/cron-jobs

import { cronJobs } from "convex/server";
import { api, internal } from "./_generated/api";

const crons = cronJobs();

crons.hourly(
  "check-expired-trials",
  { minuteUTC: 0 },
  internal.stripe.checkExpiredTrials
);

crons.daily(
  "cleanup-old-sessions",
  { hourUTC: 2, minuteUTC: 30 },
  internal.sessions.cleanupOldSessions_internal,
  { daysInactive: 1 }
);

export default crons;