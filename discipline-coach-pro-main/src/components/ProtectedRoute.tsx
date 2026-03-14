// ProtectedRoute.tsx - Wrapper component that guards authenticated routes
// TODO: Replace placeholder auth check with real authentication logic
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // TODO: Replace with actual auth state (e.g., from context or store)
  const isAuthenticated = true; // Set to true for dev preview; false would redirect

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
