import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import FooterNav from "@/components/FooterNav";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Script from 'next/script'
import type { Viewport } from 'next';
import { Toaster } from "sonner";
import { Bounce } from 'react-toastify';
import { basePath, appMetadata } from "@/config/config";

export const metadata: Metadata = {
  title: appMetadata.title,
  description: appMetadata.description
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
};

// 添加路由分组标记
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script src={`${basePath}/config.js`} strategy="beforeInteractive" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, viewport-fit=cover"
        />
        <link rel="icon" href={`${basePath}/favicon.ico`} />
      </head>
      <body
        className={`antialiased min-h-screen select-none`}
        suppressHydrationWarning>
        <Providers>
          <AuthProvider>
            <AuthGuard>
              <main>
                {children}
              </main>
              <FooterNav />
            </AuthGuard>
          </AuthProvider>
          <ToastContainer
            position="bottom-center"
            autoClose={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            theme="light"
            transition={Bounce}
          />
          <Toaster position="bottom-center" duration={1000} />
        </Providers>
      </body>
    </html>
  );
}