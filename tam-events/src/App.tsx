import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminRoute from "./routes/admin";
import HomeRoute from "./routes/home";
import "./styles/app.scss";
import LoginRoute from "./routes/login";
import { ThemeProvider } from "./theme";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/:slug" element={<HomeRoute />} />
          <Route path="/login" element={<LoginRoute />} />
          <Route
            path="/admin"
            element={
              // <RequireAuth>
              <AdminRoute />
              // </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/austin-2025" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
