// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { useSocket } from "../contexts/SocketContext";
import { LogOut, User, Settings, Ticket, BarChart3, HelpCircle, Wifi, WifiOff } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const { connected } = useSocket();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getRoleBadgeStyle = (role) => {
    return role === "admin" 
      ? "bg-purple-100 text-purple-800 hover:bg-purple-200"
      : "bg-blue-100 text-blue-800 hover:bg-blue-200";
  };

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-900">Mini Helpdesk</h1>
              <p className="text-xs text-gray-500">Support Ticket System</p>
            </div>
          </div>

          {/* Navigation Links and User Info */}
          {user ? (
            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <div className="hidden md:flex items-center gap-2">
                {connected ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-red-500" />
                    <span className="text-xs text-red-500 font-medium">Offline</span>
                  </>
                )}
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Navigation Buttons */}
              {user.role === "admin" ? (
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/my-tickets">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <BarChart3 className="w-4 h-4" />
                      My Tickets
                    </Button>
                  </Link>
                  <Link to="/ticket">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Ticket className="w-4 h-4" />
                      Submit Ticket
                    </Button>
                  </Link>
                </div>
              )}

              <Separator orientation="vertical" className="h-6" />

              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="hidden md:block text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{user.name}</span>
                    <Badge className={getRoleBadgeStyle(user.role)} variant="secondary">
                      {user.role === "admin" ? "Admin" : "User"}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>

                {/* User Avatar */}
                <div className="bg-gray-100 p-2 rounded-full">
                  <User className="w-5 h-5 text-gray-600" />
                </div>

                {/* Logout Button */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">Logout</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button>
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;