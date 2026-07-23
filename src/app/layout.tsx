import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import NavBar from "@/components/NavBar";
import StoreInit from "@/components/StoreInit";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Teapp — Tea Management",
  description: "A cozy modern tea management webapp",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>
            <StoreInit />
            <NavBar />
            <main className="min-h-[calc(100vh-64px)] px-4 sm:px-6 lg:px-8 py-6 overflow-x-hidden pb-20 sm:pb-6">
              {children}
            </main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}