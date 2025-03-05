"use client";

import Script from "next/script";
import type { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";;
import { Toaster } from "@workspace/ui/components/sonner"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConvexQueryClient } from "@convex-dev/react-query";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const convexQueryClient = new ConvexQueryClient(convex);
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			queryKeyHashFn: convexQueryClient.hashFn(),
			queryFn: convexQueryClient.queryFn(),
		},
	},
});

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
	return (
		<ConvexAuthNextjsProvider client={convex}>
			<QueryClientProvider client={queryClient}>
				<Script
					strategy="afterInteractive"
					id="intercom-settings"
					dangerouslySetInnerHTML={{
						__html: `
								window.intercomSettings = {
										api_base: "https://api-iam.intercom.io",
										app_id: "anqwv2h0",
								};
						`
					}}
				/>
				{children}
				<Toaster />
			</QueryClientProvider>
		</ConvexAuthNextjsProvider>
	);
}
