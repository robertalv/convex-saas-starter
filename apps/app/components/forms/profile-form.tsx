"use client";

import ImageUpload from "../image-upload";
import { ProfileFormData } from "@/types";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { memo, useCallback } from "react";

const ProfileForm = memo(({
  data,
  onChange,
  onSubmit,
  onBack
}: {
  data: ProfileFormData;
  onChange: (data: ProfileFormData) => void;
  onSubmit: () => void;
  onBack: () => void;
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
        type="users"
        data={data}
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
      {onBack && (
        <Button onClick={onBack} className="w-full" variant="outline">
          Back
        </Button>
      )}
    </div>
  );
});

export default ProfileForm;