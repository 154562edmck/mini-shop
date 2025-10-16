"use client";

import React from "react";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';


export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <NextUIProvider >
            <NextThemesProvider
                attribute="class"
                enableSystem={false}
                disableTransitionOnChange
            >
                {children}
            </NextThemesProvider>
        </NextUIProvider>
    );
}