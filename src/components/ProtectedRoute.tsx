import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem('token');

  // 토큰이 없다면 로그인 페이지로
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

