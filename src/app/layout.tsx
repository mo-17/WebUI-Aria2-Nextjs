import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import { Nav } from "@/components/layout/nav";
import { Notifications } from "@/components/ui/notifications";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WebUI-Aria2",
  description: "A modern web interface for aria2",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        <Providers>
          <div className="flex flex-col h-full md:pt-16">
            <Nav />
            {children}
            <Notifications />
          </div>
        </Providers>
      </body>
    </html>
  );
}
