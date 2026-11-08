import React from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  featureName?: string;
  description?: string;
  onExplorePublic?: () => void;
}

/**
 * ProtectedRoute Component
 * Sign-in and sign-up gating has been bypassed for frictionless testing as requested.
 * Supabase client remains fully operational in the background for real data persistence.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  return <>{children}</>;
};
