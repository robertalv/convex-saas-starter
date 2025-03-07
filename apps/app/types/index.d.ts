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
  color: string;
}

export type User = {
  _creationTime: number;
  _id: Id<"users">;
  activeOrgId?: Id<"organization"> | ActiveOrg | string;
  email: string;
  emailVerificationTime?: number;
  emailVerified?: boolean;
  image?: string;
  isOnboardingComplete: boolean;
  name?: string;
  firstName?: string;
  lastName?: string;
  orgIds?: {
    id: Id<"organization">;
    role: OrganizationRole;
    status: Status;
  }[];
  phone?: string;
  phoneVerified?: boolean;
  providers?: string[];
  activeOrg?: ActiveOrg;
  color: string;
}

export type ActiveOrg = {
  _id: Id<"organization">;
  _creationTime: number;
  name: string;
  image?: string;
  slug: string;
  color: string;
  customerId?: string;
  extendedFreeTrial?: boolean;
  updatedBy?: Id<"users">;
  updatedTime?: number;
  ownerId?: Id<"users">;
  joinCode?: string;
  plan?: string;
}

export type OrganizationRole = "org:owner" | "org:admin" | "org:member"

export type Status = "pending" | "active" | "disabled"

export type OnboardingProps = {
  update: ReactMutation<FunctionReference<"mutation", "public", UserProfile, null, string | undefined>>;
  user: User & { activeOrg?: ActiveOrg };
}

export type ProfileFormData = {
  firstName: string;
  lastName: string;
  name: string;
  image: string;
}

export type OrgFormData = {
  name: string;
  image: string;
  slug: string;
}

export type ViewerUser = (User & { activeOrg?: ActiveOrg }) | null;

export type NavItem = {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  items?: {
    title: string
    url: string
  }[]
}
