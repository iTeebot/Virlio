import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProviderWrapper } from "@/providers/session-provider";
import { ToastProvider } from "@/providers/toast-provider";
import { AnimationProvider } from "@/providers/animation-provider";
import { SiteBackground } from "@/components/layout/site-background";
import { AccessibilityFloatingToggle } from "@/components/layout/accessibility-toggle";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "Virlio — AI Meme Generator for Brands & Businesses",
  description: "Turn your brand into viral content with Virlio. Verified business profiles, community meme templates, AI moderation, and social publishing.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/images/favicon.ico",
    apple: "/images/favicon.ico",
  },
  openGraph: {
    title: "Virlio — AI Meme Generator for Brands & Businesses",
    description: "Turn your brand into viral content with AI meme generation, verified profiles, and automated growth suggestions.",
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
          <AnimationProvider>
            <ToastProvider>
              <SiteBackground />
              {children}
              <AccessibilityFloatingToggle />
            </ToastProvider>
          </AnimationProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
