"use client";

import { useRouter } from "next/navigation";
import { FaChevronLeft } from "react-icons/fa6";

interface PageHeaderProps {
    title: string;
    right?: React.ReactNode;
    onBackAction?: () => void;
}

export const PageHeader = ({ title, right, onBackAction }: PageHeaderProps) => {
    const router = useRouter();

    const handleBack = () => {
        if (onBackAction) {
            onBackAction();
        } else {
            router.back();
        }
    };

    return (
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
            <div className="flex items-center justify-between px-4 h-[48px]">
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleBack}
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
                    >
                        <FaChevronLeft />
                    </button>
                    <h1 className="font-semibold">{title}</h1>
                </div>
                {right && <div>{right}</div>}
            </div>
        </div>
    );
};