import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth } from "./auth/auth-guard";
import AdminRoute from "./routes/admin";
import HomeRoute from "./routes/home";
import LoginRoute from "./routes/login";
import "./styles/app.scss";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/login" element={<LoginRoute />} />
        <Route
          path="/admin"
          element={
            // <RequireAuth>
            <AdminRoute />
            // </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
