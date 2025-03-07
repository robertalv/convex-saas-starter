"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { UploadIcon, UserCircle } from "lucide-react";
import { memo, useCallback } from "react";
import { useGenerateUploadUrl } from "@/hooks/use-generate-upload-url";
import { useDeleteImage } from "@/hooks/use-delete-image";
import { Id } from "@workspace/backend/convex/_generated/dataModel";
import { toast } from "sonner";
import { UploadButton, UploadFileResponse } from "@xixixao/uploadstuff/react";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/convex/_generated/api";

const ImageUpload = memo(({
  image,
  data,
  type,
  label,
  onImageChange,
}: {
  image?: string;
  data: any;
  type: "organization" | "users";
  label: string;
  onImageChange?: (image: string) => void;
}) => {
  const { mutate: generateUploadUrl } = useGenerateUploadUrl();
  const { mutate: deleteImage } = useDeleteImage();
  const updateUser = useMutation(api.users.update);
  const updateOrganization = useMutation(api.organization.update);

  const storageId = image?.split("storageId=")[1];

  const updateImage = useCallback(async (url: string) => {
    if (type === "organization") {
      if (onImageChange) onImageChange(url);
    }

    if (type === "users") {
      if (onImageChange) onImageChange(url);
    }
  }, [data, type, updateOrganization, updateUser, onImageChange]);

  const handleRemoveImage = useCallback(() => {
    if (!storageId) return;

    deleteImage({
      id: type === "organization" ? data._id as Id<"organization"> : data._id as Id<"users">,
      storageId: storageId as Id<"_storage">,
    })

    if (onImageChange) onImageChange("");

  }, [storageId, data, type, deleteImage, onImageChange]);

  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      <div className="mt-2 flex items-center space-x-4">
        <div className="relative h-16 w-16 rounded-full overflow-hidden border flex items-center justify-center bg-muted group">
          {image ? (
            <Avatar className="h-full w-full">
              <AvatarImage src={image} alt={label} />
              <AvatarFallback>{label[0]}</AvatarFallback>
            </Avatar>
          ) : (
            <UserCircle className="text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-row space-x-2">
          <UploadButton
            className={() =>
              "cursor-pointer inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2"
            }
            uploadUrl={() => generateUploadUrl().then(result => result?.data || '')}
            fileTypes={["image/*"]}
            onUploadComplete={async (uploaded: UploadFileResponse[]) => {
              const uploadedImage = (uploaded[0]?.response as any).storageId as string;
              const imageUrl = `${process.env.NEXT_PUBLIC_CONVEX_SITE_URL}/getImage?storageId=${uploadedImage}`;
              updateImage(imageUrl);
            }}
            onUploadError={(error: unknown) => {
              toast.error(`Upload error: ${error}`);
            }}
            content={(progress) => {
              if (progress === null) {
                return "Upload";
              }
              return `${progress}%`;
            }}
          />
          {image && (
            <Button
              onClick={handleRemoveImage}
              variant="destructive"

            >
              Remove
            </Button>
          )}
        </div>
      </div>
      <p className="text-xs mt-2 text-muted-foreground">
        We support JPG, PNG, and GIF images under 10MB
      </p>
    </div>
  );
});

ImageUpload.displayName = "ImageUpload";

export default ImageUpload;