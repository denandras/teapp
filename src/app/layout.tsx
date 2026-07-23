import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import NavBar from "@/components/NavBar";
import StoreInit from "@/components/StoreInit";

export const metadata: Metadata = {
  title: "Teapp — Tea Management",
  description: "A cozy modern tea management webapp",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <StoreInit />
          <NavBar />
          <main className="min-h-[calc(100vh-64px)] px-4 sm:px-6 lg:px-8 py-6 overflow-x-hidden">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}