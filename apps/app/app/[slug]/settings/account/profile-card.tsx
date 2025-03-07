import {
	Card,
	CardContent,
	CardHeader,
	CardFooter
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { User, ViewerUser } from "@/types";
import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { PencilIcon, CheckIcon, XIcon } from "lucide-react";

const ProfileCard = ({ user }: { user: ViewerUser | null }) => {
	const [isHovering, setIsHovering] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [firstName, setFirstName] = useState(user?.firstName || "");
	const [lastName, setLastName] = useState(user?.lastName || "");

	if (!user) return null;

	const isVerified = () => {
		if (user.emailVerified) {
			return (
				<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
					Verified
				</Badge>
			)
		} else {
			return (
				<Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
					Not Verified
				</Badge>
			)
		}
	}

	const handleUpdate = () => {
		setIsEditing(false);
	}

	const handleCancel = () => {
		setFirstName(user.firstName || "");
		setLastName(user.lastName || "");
		setIsEditing(false);
	}

	return (
		<Card
			className="relative"
			onMouseEnter={() => setIsHovering(true)}
			onMouseLeave={() => setIsHovering(false)}
		>
			<CardHeader className="pb-3">
				<h2 className="text-xl font-semibold">Profile</h2>
			</CardHeader>
			<CardContent className="space-y-4">
				{!isEditing ? (
					<>
						<div className="space-y-1">
							<h3 className="font-semibold">{user.name}</h3>
							<div className="flex items-center space-x-2">
								<p className="text-sm text-muted-foreground">{user.email}</p>
								{isVerified()}
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4 mt-4">
							<div>
								<p className="text-sm font-medium">Member Since</p>
								<p className="text-sm text-muted-foreground">
									{new Date(user._creationTime).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
								</p>
							</div>
						</div>
					</>
				) : (
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="firstName">First Name</Label>
							<Input
								id="firstName"
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="lastName">Last Name</Label>
							<Input
								id="lastName"
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
							/>
						</div>
					</div>
				)}
			</CardContent>

			{isEditing ? (
				<CardFooter className="flex justify-end space-x-2">
					<Button
						variant="outline"
						size="sm"
						onClick={handleCancel}
					>
						<XIcon className="h-4 w-4 mr-1" />
						Cancel
					</Button>
					<Button
						size="sm"
						onClick={handleUpdate}
					>
						<CheckIcon className="h-4 w-4 mr-1" />
						Save
					</Button>
				</CardFooter>
			) : (
				isHovering && (
					<div className="absolute bottom-3 right-3">
						<Button
							size="sm"
							onClick={() => setIsEditing(true)}
							className="h-8 w-8 p-0"
						>
							<PencilIcon className="h-4 w-4" />
						</Button>
					</div>
				)
			)}
		</Card>
	)
}

export default ProfileCard