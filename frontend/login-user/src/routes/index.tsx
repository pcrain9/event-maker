import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LandingPage } from "../features/landing";
import { Login } from "../features/login/login";
import { PageNotFound } from "../features/login/page-not-found";
import { Event } from "../features/events";
import { RequireAuth } from "../auth/RequireAuth";

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/event"
          element={
            <RequireAuth>
              <Event />
            </RequireAuth>
          }
        />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
};
