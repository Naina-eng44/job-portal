import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Jobs from "./pages/Jobs";
import Applications from "./pages/Applications";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./utils/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/jobs" element={
          <ProtectedRoute>
            <Jobs />
          </ProtectedRoute>
        } />

        <Route path="/applications" element={
          <ProtectedRoute>
            <Applications />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute role="employer">
            <AdminDashboard />
          </ProtectedRoute>
        } />

      </Routes>

    </BrowserRouter>
  );
}
