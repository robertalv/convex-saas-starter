import { useCallback, useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/convex/_generated/api";

type ResponseType = {
    message: string;
    status: string;
    data: string;
} | null;

type Options = {
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
    onFinally?: () => void;
    throwError?: boolean;
};

export function useGenerateUploadUrl() {
    const [data, setData] = useState<ResponseType>(null);
    const [error, setError] = useState<Error | null>(null);
    const [status, setStatus] = useState<"loading" | "success" | "error" | "finally" | null>(null);

    const isLoading = useMemo(() => status === "loading", [status]);
    const isSuccess = useMemo(() => status === "success", [status]);
    const isError = useMemo(() => status === "error", [status]);
    const isFinally = useMemo(() => status === "finally", [status]);

    const generateUploadUrlMutation = useMutation(api.files.generateUploadUrl);

    const mutate = useCallback(
        async (options?: Options) => {
            try {
                setData(null);
                setStatus("loading");
                const uploadUrl = await generateUploadUrlMutation();
                const response = {
                    message: "Upload URL generated successfully",
                    status: "success",
                    data: uploadUrl,
                };
                setData(response);
                setStatus("success");
                options?.onSuccess?.(response);
                return response;
            } catch (error) {
                setError(error as Error);
                setStatus("error");
                options?.onError?.(error);
                if (options?.throwError) {
                    throw error;
                }
            } finally {
                setStatus("finally");
                options?.onFinally?.();
            }
        },
        [generateUploadUrlMutation]
    );

    return {
        mutate,
        isLoading,
        isSuccess,
        isError,
        isFinally,
        data,
        error,
    };
}
