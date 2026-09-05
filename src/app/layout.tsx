import type { Metadata, Viewport } from "next";
import { Open_Sans } from "next/font/google";
import localFont from "next/font/local";
import { headers } from "next/headers";
import { RegisterServiceWorker } from "@/components/RegisterServiceWorker";
import { log, readRequestId } from "@/lib/logger";
import "./globals.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["600", "800"],
  variable: "--font-open-sans",
  display: "swap",
});

const glacial = localFont({
  src: [
    {
      path: "../../public/fonts/GlacialIndifference-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/GlacialIndifference-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-glacial",
  display: "swap",
});

export const metadata: Metadata = {
  title: "What's Happening | Visit AKY",
  description: "Live music, makers, and downtown Ashland, Kentucky. Confirm times before you go.",
  applicationName: "Visit AKY",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Visit AKY",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#326DCD",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const requestId = readRequestId(await headers());
  log.info("page.render", { requestId });

  return (
    <html lang="en">
      <body className={`${openSans.variable} ${glacial.variable}`}>
        <a className="skip-link" href="#main">
          Skip to events
        </a>
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}
