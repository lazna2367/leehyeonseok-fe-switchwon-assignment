import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Exchange from "./pages/Exchange";
import History from "./pages/History";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import AppLayout from "./layouts/AppLayout";

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="exchange" replace />} />
        <Route path="exchange" element={<Exchange />} />
        <Route path="history" element={<History />} />
      </Route>
    </Routes>
  );
}
