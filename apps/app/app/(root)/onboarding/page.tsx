import { Input } from "@workspace/ui/components/input";
import { useState, useCallback, memo } from "react";
import { ReactMutation, useMutation } from "convex/react";
import { Id } from "@workspace/backend/convex/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import { useRouter } from "next/navigation";
import { FunctionReference } from "convex/server";
import { UserProfile, User, ActiveOrg } from "@/types";
import { api } from "@workspace/backend/convex/_generated/api";

interface OnboardingProps {
	update: ReactMutation<FunctionReference<"mutation", "public", UserProfile, null, string | undefined>>;
	user: User & { activeOrg?: ActiveOrg };
}

interface ProfileFormData {
	firstName: string;
	lastName: string;
	name: string;
	image: string;
}

interface OrgFormData {
	name: string;
	image: string;
	slug: string;
}

const ImageUpload = memo(({
	image,
	onImageChange,
	label
}: {
	image: string;
	onImageChange: (image: string) => void;
	label: string;
}) => {
	const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				onImageChange(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	}, [onImageChange]);

	return (
		<div>
			<label className="block text-sm font-medium">{label}</label>
			<div className="mt-2 flex items-center space-x-4">
				<div className="h-16 w-16 rounded-full overflow-hidden border flex items-center justify-center bg-gray-200">
					{image ? (
						<img src={image} alt={label} className="h-full w-full object-cover" />
					) : (
						<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
							<path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2-1a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1V4a1 1 0 00-1-1H6zM5 5a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
						</svg>
					)}
				</div>
				<input
					type="file"
					accept="image/*"
					onChange={handleImageUpload}
					className="text-sm cursor-pointer"
				/>
			</div>
		</div>
	);
});

const ProfileForm = memo(({
	data,
	onChange,
	onSubmit,
}: {
	data: ProfileFormData;
	onChange: (data: ProfileFormData) => void;
	onSubmit: () => void;
}) => {
	const handleFirstNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const newFirstName = e.target.value;
		onChange({
			...data,
			firstName: newFirstName,
			name: `${newFirstName} ${data.lastName}`.trim()
		});
	}, [data.lastName, onChange]);

	const handleLastNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const newLastName = e.target.value;
		onChange({
			...data,
			lastName: newLastName,
			name: `${data.firstName} ${newLastName}`.trim()
		});
	}, [data.firstName, onChange]);

	const handleImageChange = useCallback((image: string) => {
		onChange({ ...data, image });
	}, [data, onChange]);

	return (
		<div className="space-y-4">
			<ImageUpload
				image={data.image}
				onImageChange={handleImageChange}
				label="Profile Picture"
			/>

			<div>
				<label className="block text-sm font-medium">First Name</label>
				<Input
					value={data.firstName}
					onChange={handleFirstNameChange}
					placeholder="Enter your first name"
					className="mt-1"
				/>
			</div>

			<div>
				<label className="block text-sm font-medium">Last Name</label>
				<Input
					value={data.lastName}
					onChange={handleLastNameChange}
					placeholder="Enter your last name"
					className="mt-1"
				/>
			</div>

			<Button
				onClick={onSubmit}
				className="w-full"
				disabled={!data.firstName || !data.lastName}
			>
				Continue
			</Button>
		</div>
	);
});

const OrganizationForm = memo(({
	data,
	onChange,
	onSubmit,
	onBack,
}: {
	data: OrgFormData;
	onChange: (data: OrgFormData) => void;
	onSubmit: () => void;
	onBack: () => void;
}) => {
	const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const newName = e.target.value;
		const newSlug = newName.toLowerCase().replace(/[^a-z0-9]/g, '-');
		onChange({ ...data, name: newName, slug: newSlug });
	}, [data, onChange]);

	const handleImageChange = useCallback((image: string) => {
		onChange({ ...data, image });
	}, [data, onChange]);

	return (
		<div className="space-y-4">
			<ImageUpload
				image={data.image}
				onImageChange={handleImageChange}
				label="Organization Logo"
			/>

			<div>
				<label className="block text-sm font-medium">Organization Name</label>
				<Input
					value={data.name}
					onChange={handleNameChange}
					placeholder="Enter organization name"
					className="mt-1"
				/>
			</div>

			<div>
				<label className="block text-sm font-medium">Organization URL</label>
				<div className="mt-1 flex items-center">
					<span className="text-sm text-gray-500">app.com/</span>
					<span className="text-sm">{data.slug}</span>
				</div>
			</div>

			<div className="flex flex-col gap-2 space-x-4">
				<Button
					onClick={onSubmit}
					className="w-full"
					disabled={!data.name || !data.slug}
				>
					Create Organization
				</Button>
				<Button onClick={onBack} className="w-full" variant="outline">
					Back
				</Button>
			</div>
		</div>
	);
});

const FormWrapper = memo(({ title, description, children }: {
	title: string;
	description: string;
	children: React.ReactNode;
}) => (
	<div className="flex items-center justify-center min-h-screen">
		<div className="w-full max-w-md p-8 space-y-6 shadow-md border">
			<div className="text-center">
				<h2 className="text-2xl font-bold">{title}</h2>
				<p className="mt-2 text-sm">{description}</p>
			</div>
			{children}
		</div>
	</div>
));

export const Onboarding = ({ update, user }: OnboardingProps) => {
	const router = useRouter();
	const [step, setStep] = useState(1);
	const createOrg = useMutation(api.organization.create);
	const completeOnboarding = useMutation(api.organization.completeOnboarding);

	const [profileData, setProfileData] = useState<ProfileFormData>({
		firstName: user?.firstName || "",
		lastName: user?.lastName || "",
		name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
		image: user?.image || ""
	});

	const [orgData, setOrgData] = useState<OrgFormData>({
		name: "",
		image: "",
		slug: ""
	});

	const handleProfileSubmit = useCallback(async () => {
		if (!user?._id) return;

		try {
			await update({
				id: user._id as Id<"users">,
				...profileData,
			});
			setStep(2);
		} catch (error) {
			console.error("Failed to update profile:", error);
		}
	}, [profileData, update, user?._id]);

	const handleOrgSubmit = useCallback(async () => {
		try {
			const { id: orgId } = await createOrg({
				name: orgData.name,
				slug: orgData.slug,
				image: orgData.image,
			});

			await completeOnboarding({
				orgId,
				currency: "usd",
			});

			router.push("/");
		} catch (error) {
			console.error("Failed to create organization:", error);
		}
	}, [createOrg, completeOnboarding, orgData, router]);

	return step === 1 ? (
		<FormWrapper
			title="Complete Your Profile"
			description="Please provide your information to get started"
		>
			<ProfileForm
				data={profileData}
				onChange={setProfileData}
				onSubmit={handleProfileSubmit}
			/>
		</FormWrapper>
	) : (
		<FormWrapper
			title="Create your organization"
			description="Let's get started by creating your organization"
		>
			<OrganizationForm
				data={orgData}
				onChange={setOrgData}
				onSubmit={handleOrgSubmit}
				onBack={() => setStep(1)}
			/>
		</FormWrapper>
	);
};