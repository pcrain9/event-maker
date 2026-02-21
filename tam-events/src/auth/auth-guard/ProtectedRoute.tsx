import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import type { ReactNode } from "react";

type ProtectedRouteProps = {
  children: ReactNode;
};

/**
 * Route protection wrapper component
 *
 * Behavior:
 * - If authenticated: Render children (protected content)
 * - If not authenticated: Redirect to /login
 *
 * Usage:
 * <Route path="/admin" element={
 *   <ProtectedRoute>
 *     <AdminRoute />
 *   </ProtectedRoute>
 * } />
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  // Render protected content
  return <>{children}</>;
}
