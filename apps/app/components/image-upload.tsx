"use client";

import { memo, useCallback } from "react";

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

export default ImageUpload;