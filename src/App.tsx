import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Auth from "./pages/Auth";

import Home from "./pages/Home";
import Bars from "./pages/Bars";
import User from "./pages/User";
import Shop from "./pages/Shop";
import Infos from "./pages/Infos";
import Settings from "./pages/Settings";

import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import AuthCallback from "./pages/AuthCallback";
import Onboarding from "./pages/Onboarding";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* publiques */}
        <Route path="/infos" element={<Infos />} />
        <Route path="/auth" element={<Auth />} />          {/* <--- nouveau */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* protégées */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Home />} />
          <Route path="bars" element={<Bars />} />
          <Route path="me" element={<User />} />
          <Route path="shop" element={<Shop />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
