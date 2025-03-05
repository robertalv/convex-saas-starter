import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";

export function SignInWithCode({
	handleCodeSent,
	provider,
	children,
}: {
	handleCodeSent: (email: string) => void;
	provider?: string;
	children?: React.ReactNode;
}) {
	const { signIn } = useAuthActions();
	const [submitting, setSubmitting] = useState(false);

	return (
		<form
			className="grid gap-y-2"
			onSubmit={async (event) => {
				event.preventDefault();
				setSubmitting(true);
				const formData = new FormData(event.currentTarget);

				try {
					await signIn(provider ?? "resend-otp", formData);
					handleCodeSent(formData.get("email") as string);
				} catch (error: any) {
					console.error(error);
					if (error.message && error.message.includes("Account creation is disabled")) {
						toast.message("Account creation is disabled", {
							description: "If this is a mistake, please contact support. If not, please feel free to sign up for our waitlist!",
						});
					} else {
						toast.message("No account found", {
							description: "If this is a mistake, please contact support. If not, please feel free to sign up for our waitlist!",
						});
					}
				} finally {
					setSubmitting(false);
				}
			}}
		>
			<Input
				id="email"
				type="email"
				name="email"
				placeholder="m@convex-starter.com"
				required
			/>
			{children}
			<Button type="submit" disabled={submitting}>
				{submitting ? "Sending..." : "Continue"}
			</Button>
		</form>
	);
}