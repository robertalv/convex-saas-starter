import { useState, useCallback, memo } from "react";
import { useMutation } from "convex/react";
import { Id } from "@workspace/backend/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { OnboardingProps, ProfileFormData, OrgFormData } from "@/types";
import { api } from "@workspace/backend/convex/_generated/api";
import FormWrapper from "../../components/form-wrapper";
import ProfileForm from "../../components/forms/profile-form";
import OrganizationForm from "../../components/forms/organization-form";

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