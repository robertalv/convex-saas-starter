import { useCallback, useMemo, useState } from "react"
import { useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend/convex/_generated/api";
import { Doc, Id } from "@workspace/backend/convex/_generated/dataModel";

type RequestType = {
    orgId: Id<"organization">;
    userId: Id<"users">;
    code?: string;
};

type ResponseType = {
    success: boolean;
    message: string;
}

type Options = {
    onSuccess: (data: any) => void;
    onError: (error: any) => void;
    onFinally: () => void;
    throwError?: boolean;
}

export const useEnterCode = () => {
    const [data, setData] = useState<ResponseType | null>(null)
    const [error, setError] = useState<Error | null>(null)
    const [status, setStatus] = useState<"pending" | "loading" | "success" | "error">("pending")

    const isLoading = useMemo(() => status === "loading", [status])
    const isSuccess = useMemo(() => status === "success", [status])
    const isError = useMemo(() => status === "error", [status])

    const enterCode = useMutation(api.users.addUserToOrg);

    const mutate = useCallback(async (values: RequestType, options?: Options) => {
        try {
            setData(null)
            setError(null)
            setStatus("loading")

            const result = await enterCode({
                orgId: values.orgId as Id<"organization">,
                userId: values?.userId as Id<"users">,
                code: values?.code
            })

            setData(result)
            setStatus("success")
            options?.onSuccess?.(result)
        } catch (error) {
            setError(error as Error)
            setStatus("error")
            options?.onError?.(error)
            if (options?.throwError) {
                throw error
            }
        } finally {
            options?.onFinally?.()
        }
    }, [enterCode])

    return {
        mutate,
        isLoading,
        isSuccess,
        isError,
        data,
        error,
        status
    }
}
