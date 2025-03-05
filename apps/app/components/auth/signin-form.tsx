"use client";

import { useCallback, useState } from "react"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import Image from "next/image"
import { useAuthActions } from "@convex-dev/auth/react";
import { SignInWithGoogle } from "@/components/auth/signin-with-google";
import { toast } from "sonner";
import { CodeInput } from "@/components/auth/code-input";
import { SignInWithCode } from "@/components/auth/signin-with-code";
import { SignInWithGithub } from "@/components/auth/signin-with-github";

export function SigninForm({
	className,
	...props
}: React.ComponentPropsWithoutRef<"div">) {
	const { signIn } = useAuthActions();
	const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
	const [submitting, setSubmitting] = useState(false);

	const handleCodeSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setSubmitting(true);
		const formData = new FormData(event.currentTarget);

		try {
			await signIn("resend-otp", formData);
			toast.message("Code entered successfully", {
				description: "Redirecting you to the home page",
			});
		} catch (error) {
			console.error("Error signing in", error);
			toast.message("Code could not be verified, try again", {
				description: "Please check your email for the verification code",
			});
		} finally {
			setSubmitting(false);
			window.location.reload();
		}
	}, [signIn]);

	return (

		<div className={cn("flex flex-col gap-6", className)} {...props}>
			{step === "signIn" ? (
				<>
					<div className="flex flex-col gap-6">
						<div className="flex flex-col items-center gap-2">
							<a
								href="/"
								className="flex flex-col items-center gap-2 font-medium"
							>
								<div className="flex items-center justify-center rounded-md">
									<Image
										src="/convex.png"
										alt="Convex Starter Logo"
										width={60}
										height={60}
									/>
								</div>
								<span className="sr-only">Convex Starter</span>
							</a>
							<h1 className="text-xl font-bold">Welcome to Convex Starter</h1>
							<div className="text-center text-sm">
								Sign in
							</div>
						</div>
						<div className="flex flex-col gap-2">
							<div className="grid gap-2">
								<SignInWithCode handleCodeSent={(email) => setStep({ email })} />
							</div>
						</div>
						<div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
							<span className="relative z-10 bg-background px-2 text-muted-foreground">
								or
							</span>
						</div>
						<div className="grid gap-2 sm:grid-cols-2">
							<SignInWithGoogle />
							<SignInWithGithub />
						</div>
					</div>
					<div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary  ">
						By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
						and <a href="#">Privacy Policy</a>.
					</div>
				</>
			) : (
				<>
					<form>
						<div className="flex flex-col gap-6">
							<div className="flex flex-col items-center gap-2">
								<a
									href="/"
									className="flex flex-col items-center gap-2 font-medium"
								>
									<div className="flex items-center justify-center rounded-md">
										<Image
											src="/convex.png"
											alt="Convex Starter Logo"
											width={60}
											height={60}
										/>
									</div>
									<span className="sr-only">Convex Starter</span>
								</a>
								<h1 className="text-xl font-bold">Check your email</h1>
								<div className="text-center text-sm">
									Enter the verification code sent to your email
								</div>
							</div>
							<div className="flex flex-col gap-2">
								<form
									className="flex flex-col space-y-2"
									onSubmit={handleCodeSubmit}
								>
									<CodeInput />
									<input name="email" value={step.email} type="hidden" />
									<Button type="submit" disabled={submitting}>
										{submitting ? "Verifying..." : "Verify"}
									</Button>
								</form>
							</div>
							<div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
								<span className="relative z-10 bg-background px-2 text-muted-foreground">
									or
								</span>
							</div>
							<div className="grid gap-4 sm:grid-cols-1">
								<Button
									type="button"
									variant="link"
									onClick={() => setStep("signIn")}
								>
									Use another method
								</Button>
							</div>
						</div>
					</form>
					<div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary  ">
						By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
						and <a href="#">Privacy Policy</a>.
					</div>
				</>
			)}
		</div>
	)
}
