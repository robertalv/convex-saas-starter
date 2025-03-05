// https://docs.convex.dev/scheduling/cron-jobs

import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.hourly(
  "check-expired-trials",
  { minuteUTC: 0 },
  internal.stripe.checkExpiredTrials
);

export default crons;