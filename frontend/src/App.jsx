import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { SocketProvider } from "./contexts/SocketContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import TicketForm from "./pages/TicketForm";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import { useEffect, useState } from "react";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize user state on mount
  useEffect(() => {
    const initializeUser = () => {
      const stored = localStorage.getItem("user");
      setUser(stored ? JSON.parse(stored) : null);
      setLoading(false);
    };
    
    // Small delay to prevent flash
    const timer = setTimeout(initializeUser, 100);
    return () => clearTimeout(timer);
  }, []);

  // Listen for changes to localStorage (login/logout)
  useEffect(() => {
    const onStorage = () => {
      const stored = localStorage.getItem("user");
      setUser(stored ? JSON.parse(stored) : null);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Helper to update user after login
  const handleLogin = () => {
    const stored = localStorage.getItem("user");
    setUser(stored ? JSON.parse(stored) : null);
  };

  // Show loading screen while determining auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-blue-600 p-3 rounded-xl shadow-lg mx-auto mb-4 w-fit">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Mini Helpdesk</h2>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <SocketProvider>
      <Router>
        {/* Only show navbar when user is authenticated */}
        {user && <Navbar />}
        <Routes>
          <Route
            path="/"
            element={user ? (
              user.role === "admin" ? <Navigate to="/dashboard" /> : <Navigate to="/my-tickets" />
            ) : (
              <Navigate to="/login" />
            )}
          />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route
            path="/ticket"
            element={user && user.role === "user" ? <TicketForm /> : <Navigate to="/login" />}
          />
          <Route
            path="/my-tickets"
            element={user && user.role === "user" ? <UserDashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/dashboard"
            element={user && user.role === "admin" ? <AdminDashboard /> : <Navigate to="/login" />}
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Toaster />
      </Router>
    </SocketProvider>
  );
}

export default App;
