import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import NavBar from "@/components/NavBar";
import StoreInit from "@/components/StoreInit";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/components/AuthProvider";
import AuthGate from "@/components/AuthGate";
import DomainRedirectBanner from "@/components/DomainRedirectBanner";

export const metadata: Metadata = {
  title: "Teapp — Tea Management",
  description: "A cozy modern tea management webapp",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>
            <StoreInit />
            <DomainRedirectBanner />
            <AuthGate>
              <div className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--bg)" }}>
                <NavBar />
                <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 overflow-x-hidden pb-24 sm:pb-6">
                  <div className="max-w-[1200px] mx-auto w-full">
                    {children}
                  </div>
                </main>
                <Footer />
              </div>
            </AuthGate>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}