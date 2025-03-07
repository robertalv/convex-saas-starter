import { SigninForm } from "@/components/auth/signin-form";

export default function Signin() {
	return (
		<div className="flex min-h-svh w-full flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
			<div className="w-full max-w-sm">
				<SigninForm />
			</div>
		</div>
	)
}
