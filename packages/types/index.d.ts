import { Id } from "@workspace/backend/convex/_generated/dataModel";

export type UserProfile = {
  accounts?: Id<"accounts">[] | undefined;
  email?: string | undefined;
  emailVerified?: boolean | undefined;
  image?: string | undefined;
  firstName?: string | undefined;
  lastName?: string | undefined;
  name?: string | undefined;
  phone?: string | undefined;
  isOnboardingComplete?: boolean | undefined;
  id: Id<"users">;
}