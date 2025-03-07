import aggregate from "@convex-dev/aggregate/convex.config";
import { defineApp } from "convex/server";

const app = defineApp();

// App
app.use(aggregate, { name: "aggregateUsersByOrg" });

// Admin
app.use(aggregate, { name: "aggregateUsers" });
app.use(aggregate, { name: "aggregateOrganizations" });

export default app;