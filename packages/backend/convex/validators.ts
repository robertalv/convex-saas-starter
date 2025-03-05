import { Infer, v } from "convex/values";

export const OrganizationRole = v.union(
  v.literal("org:owner"),
  v.literal("org:admin"),
  v.literal("org:member"),
);

export const CURRENCIES = {
  USD: "usd",
  EUR: "eur",
} as const;
export const currencyValidator = v.union(
  v.literal(CURRENCIES.USD),
  v.literal(CURRENCIES.EUR),
);
export type Currency = Infer<typeof currencyValidator>;

export const INTERVALS = {
  MONTH: "month",
  YEAR: "year",
} as const;
export const intervalValidator = v.union(
  v.literal(INTERVALS.MONTH),
  v.literal(INTERVALS.YEAR),
);
export type Interval = Infer<typeof intervalValidator>;

export const PLANS = {
  // FREE: "free",
  STANDARD: "standard",
  PRO: "pro",
  ENTERPRISE: "enterprise",
} as const;
export const planKeyValidator = v.union(
  // v.literal(PLANS.FREE),
  v.literal(PLANS.STANDARD),
  v.literal(PLANS.PRO),
  v.literal(PLANS.ENTERPRISE),
);
export type PlanKey = Infer<typeof planKeyValidator>;
const priceValidator = v.object({
  stripeId: v.string(),
  amount: v.number(),
});

export const pricesValidator = v.object({
  [CURRENCIES.USD]: priceValidator,
  [CURRENCIES.EUR]: priceValidator,
});