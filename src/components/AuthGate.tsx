"use client";

import { type ReactNode } from "react";
import { useAuth } from "@/components/AuthProvider";

/**
 * AuthGate wraps all authenticated layout content (NavBar, main, Footer).
 * It prevents page flash by only rendering children once the user is
 * authenticated or in demo mode. The loading, error, and unauthenticated
 * states are handled entirely inside AuthProvider (loading spinner, error
 * message, or LoginForm), so AuthGate renders nothing during those states.
 */
export default function AuthGate({ children }: { children: ReactNode }) {
  const { loading, user, isDemo } = useAuth();

  if (loading || (!user && !isDemo)) {
    return null;
  }

  return <>{children}</>;
}