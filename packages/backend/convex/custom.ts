import {
  MutationCtx,
  internalAction as rawInternalAction,
  internalMutation as rawInternalMutation,
  mutation as rawMutation
} from "./_generated/server";

import { TableAggregate } from "@convex-dev/aggregate";
import { customAction, customCtx, customMutation } from "convex-helpers/server/customFunctions";
import { Triggers } from "convex-helpers/server/triggers";
import { components } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { DataModel } from "./_generated/dataModel";

const triggers = new Triggers<DataModel, MutationCtx>();

export const aggregateUsersByOrg = new TableAggregate<{
  Key: [Id<"organization">, Id<"users">, string];
  DataModel: DataModel;
  TableName: "users";
}>(
  components.aggregateUsersByOrg,
  {
    sortKey: (doc) => [doc.activeOrgId as Id<"organization">, doc._id, doc.name as string]
  }
);

export const aggregateUsers = new TableAggregate<{
  Key: Id<"users">;
  DataModel: DataModel;
  TableName: "users";
}>(
  components.aggregateUsers,
  {
    sortKey: (doc) => doc._id
  }
);

export const aggregateOrganizations = new TableAggregate<{
  Key: Id<"organization">;
  DataModel: DataModel;
  TableName: "organization";
}>(
  components.aggregateOrganizations,
  {
    sortKey: (doc) => doc._id
  }
);


// Triggers
triggers.register("users", aggregateUsersByOrg.trigger());
triggers.register("organization", aggregateOrganizations.trigger());
triggers.register("users", aggregateUsers.trigger());

// Functions
export const mutation = customMutation(rawMutation, customCtx(triggers.wrapDB));
export const internalMutation = customMutation(rawInternalMutation, customCtx(triggers.wrapDB));
export const internalAction = customAction(rawInternalAction, customCtx(() => ({})));