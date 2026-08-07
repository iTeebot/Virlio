import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProviderWrapper } from "@/providers/session-provider";
import { ToastProvider } from "@/providers/toast-provider";
import { AnimationProvider } from "@/providers/animation-provider";
import { SiteBackground } from "@/components/layout/site-background";
import { AccessibilityFloatingToggle } from "@/components/layout/accessibility-toggle";
import { UserStoreProvider } from "@/providers/user-store-provider";
import { TemplateProvider } from "@/providers/template-provider";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://virlio.iteebot.com"),
  title: "Virlio — AI-Powered Meme & Social Content Platform",
  description: "Virlio helps businesses and creators create branded memes and social media content with AI. Create content from templates, customize it to your brand, generate AI-assisted captions, and prepare content for your social channels.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/images/favicon.ico",
    apple: "/images/favicon.ico",
  },
  openGraph: {
    title: "Virlio — AI-Powered Meme & Social Content Platform",
    description: "Virlio helps businesses and creators create branded memes and social media content with AI. Create content from templates, customize it to your brand, generate AI-assisted captions, and prepare content for your social channels.",
    url: "https://virlio.iteebot.com",
    siteName: "Virlio",
    images: ["/images/social.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-white text-gray-900"
        suppressHydrationWarning
      >
        <SessionProviderWrapper>
          <UserStoreProvider>
            <AnimationProvider>
              <ToastProvider>
                <TemplateProvider>
                  <SiteBackground />
                  {children}
                  <AccessibilityFloatingToggle />
                  <Analytics />
                </TemplateProvider>
              </ToastProvider>
            </AnimationProvider>
          </UserStoreProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
