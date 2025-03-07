"use client";

import ImageUpload from "../image-upload";
import { OrgFormData } from "@/types";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { memo, useCallback } from "react";

const OrganizationForm = memo(({
    data,
    onChange,
    onSubmit,
    onBack,
}: {
    data: OrgFormData;
    onChange: (data: OrgFormData) => void;
    onSubmit: () => void;
    onBack?: () => void;
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
                type="organization"
                data={data}
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
                {onBack && (
                    <Button onClick={onBack} className="w-full" variant="outline">
                        Back
                    </Button>
                )}
            </div>
        </div>
    );
});

export default OrganizationForm;