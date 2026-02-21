import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminRoute from "./routes/admin";
import HomeRoute from "./routes/home";
import "./styles/app.scss";
import LoginRoute from "./routes/login";
import { ThemeProvider } from "./theme";
import { useAuthStore } from "./auth/store/authStore";
import ProtectedRoute from "./auth/auth-guard/ProtectedRoute";

function App() {
  const restoreSession = useAuthStore((state) => state.restoreSession);

  // Restore authentication session on app mount
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/:slug" element={<HomeRoute />} />
          <Route path="/login" element={<LoginRoute />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminRoute />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/austin-2025" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
