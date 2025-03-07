import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@workspace/backend/convex/_generated/api";

const isSignInPage = createRouteMatcher(["/signin"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const token = await convexAuth.getToken();
  const user = await fetchQuery(api.users.viewer, {}, { token });

  if (!user && !token) {
    if (!isSignInPage(request)) {
      return nextjsMiddlewareRedirect(request, "/signin");
    }
  } else if (isSignInPage(request)) {
    return nextjsMiddlewareRedirect(request, `/${user?.activeOrg?.slug || 'dashboard'}`);
  }
});

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};