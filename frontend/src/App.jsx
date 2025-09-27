import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import TicketForm from "./pages/TicketForm";
import AdminDashboard from "./pages/AdminDashboard";
import { useEffect, useState } from "react";
import { SocketProvider } from "./contexts/SocketContext";

function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

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

  return (
    <SocketProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={user ? (
              user.role === "admin" ? <Navigate to="/dashboard" /> : <Navigate to="/ticket" />
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
            path="/dashboard"
            element={user && user.role === "admin" ? <AdminDashboard /> : <Navigate to="/login" />}
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </SocketProvider>
  );
}

export default App;
