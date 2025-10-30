import { Navigate } from "react-router-dom";

interface PublicRouteProps {
  children: React.ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const token = localStorage.getItem('token');

  // 이미 로그인되어 있으면 환전 페이지로 리다이렉트
  if (token) {
    return <Navigate to="/exchange" replace />;
  }

  return <>{children}</>;
}

