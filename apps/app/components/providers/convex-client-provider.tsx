"use client";

import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";
import { Toaster } from "@workspace/ui/components/sonner"

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
	return (
		<ConvexAuthNextjsProvider client={convex}>
			{children}
			<Toaster />
		</ConvexAuthNextjsProvider>
	);
}