"use client";

import { memo } from "react";

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

export default FormWrapper;