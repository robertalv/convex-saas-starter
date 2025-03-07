import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
	InputOTPSeparator
} from "@workspace/ui/components/input-otp";

export function CodeInput({ length = 8 }: { length?: number }) {
	return (
		<div className="mb-4">
			<InputOTP maxLength={8} name="code" id="code">
				<InputOTPGroup className="flex gap-2">
					{Array(length)
						.fill(null)
						.map((_, index) => (
							<InputOTPSlot
								key={index}
								index={index}
								className="w-10 h-10 bg-zinc-900 text-accent-foreground flex items-center justify-center text-2xl border border-zinc-800 code-font !rounded-none"
							/>
						))}
				</InputOTPGroup>
			</InputOTP>
		</div>
	);
}