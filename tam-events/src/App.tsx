import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminRoute from "./routes/admin";
import HomeRoute from "./routes/home";
import "./styles/app.scss";
import LoginRoute from "./routes/login";

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
