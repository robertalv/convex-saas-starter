import { useCallback, useState } from "react";
import { useAction } from "convex/react";
import { api } from "@workspace/backend/convex/_generated/api";
import { Id } from "@workspace/backend/convex/_generated/dataModel";

type DeleteImageProps = {
    id?: Id<"organization"> | Id<"users">;
    storageId: Id<"_storage">;
};

type Options = {
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
    onFinally?: () => void;
};

export function useDeleteImage() {
    const [isLoading, setIsLoading] = useState(false);
    const deleteImageMutation = useAction(api.files.deleteById);

    const mutate = useCallback(
        async (props: DeleteImageProps, options?: Options) => {
            try {
                setIsLoading(true);
                const result = await deleteImageMutation({
                    id: props.id,
                    storageId: props.storageId,
                });
                options?.onSuccess?.(result);
                return result;
            } catch (error) {
                options?.onError?.(error);
                throw error;
            } finally {
                setIsLoading(false);
                options?.onFinally?.();
            }
        },
        [deleteImageMutation]
    );

    return {
        mutate,
        isLoading,
    };
}