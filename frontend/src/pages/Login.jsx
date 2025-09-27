import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { HelpCircle, Mail, Lock, User, LogIn, UserPlus, AlertCircle, Shield, Eye, EyeOff, Info } from "lucide-react";

const Login = ({ onLogin }) => {
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("user");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    // Form validation
    const validateForm = () => {
        const newErrors = {};
        
        if (isRegister && !name.trim()) {
            newErrors.name = "Name is required";
        }
        
        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Please enter a valid email";
        }
        
        if (!password.trim()) {
            newErrors.password = "Password is required";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error("Please fix the errors before submitting");
            return;
        }
        
        setLoading(true);
        setError("");
        
        try {
            let res;
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
            if (isRegister) {
                res = await axios.post(`${API_URL}/api/auth/register`, {
                    name,
                    email,
                    password,
                    role,
                });
                toast.success("Account created successfully!");
            } else {
                res = await axios.post(`${API_URL}/api/auth/login`, {
                    email,
                    password,
                });
                toast.success(`Welcome back, ${res.data.user.name}!`);
            }

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));

            if (typeof onLogin === "function") onLogin();

            // Navigate immediately after successful login
            if (res.data.user.role === "admin") {
                navigate("/dashboard");
            } else {
                navigate("/my-tickets");
            }
            
        } catch (err) {
            const data = err.response?.data;
            if (data?.errors && Array.isArray(data.errors)) {
                const errorMsg = data.errors.map(e => e.msg).join(" | ");
                setError(errorMsg);
                toast.error(errorMsg);
            } else {
                const errorMsg = data?.message || "An error occurred";
                setError(errorMsg);
                toast.error(errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsRegister(!isRegister);
        setError("");
        setErrors({});
        setName("");
        setEmail("");
        setPassword("");
        setRole("user");
    };

    const getRoleBadgeStyle = (role) => {
        return role === "admin" 
            ? "bg-purple-100 text-purple-800 border-purple-200"
            : "bg-blue-100 text-blue-800 border-blue-200";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Header */}
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
                            <HelpCircle className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        Mini Helpdesk
                    </h1>
                    <p className="text-sm text-gray-600 mt-2">
                        Support Ticket Management System
                    </p>
                </div>

                {/* Main Card */}
                <Card className="shadow-lg border bg-white">
                    <CardHeader className="text-center space-y-2">
                        <CardTitle className="text-xl font-semibold flex items-center justify-center gap-2">
                            {isRegister ? (
                                <>
                                    <UserPlus className="w-5 h-5 text-blue-600" />
                                    Create Account
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5 text-blue-600" />
                                    Welcome Back
                                </>
                            )}
                        </CardTitle>
                        <CardDescription className="text-gray-600 text-sm">
                            {isRegister 
                                ? "Create your account to get started"
                                : "Sign in to access your dashboard"
                            }
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Registration Fields */}
                            {isRegister && (
                                <>
                                    {/* Demo Note for Registration */}
                                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                        <div className="flex items-start gap-2">
                                            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                            <div className="text-sm">
                                                <p className="font-medium text-amber-800 mb-1">Demo Project Note</p>
                                                <p className="text-amber-700 text-xs leading-relaxed">
                                                    Admin account creation is enabled for demonstration purposes.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Name Field */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            Full Name *
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <Input
                                                type="text"
                                                placeholder="Enter your full name"
                                                value={name}
                                                onChange={(e) => {
                                                    setName(e.target.value);
                                                    if (errors.name) {
                                                        setErrors(prev => ({ ...prev, name: "" }));
                                                    }
                                                }}
                                                className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                                            />
                                        </div>
                                        {errors.name && (
                                            <div className="flex items-center gap-1 text-red-500 text-xs">
                                                <AlertCircle className="w-3 h-3" />
                                                <span>{errors.name}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Role Selection */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            Account Type *
                                        </label>
                                        <Select value={role} onValueChange={setRole}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select account type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="user">Regular User</SelectItem>
                                                <SelectItem value="admin">Administrator</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        
                                        {/* Role Description */}
                                        {role && (
                                            <div className="flex items-center gap-2 pt-1">
                                                <Badge className={getRoleBadgeStyle(role)} variant="secondary">
                                                    {role === "admin" ? (
                                                        <>
                                                            <Shield className="w-3 h-3 mr-1" />
                                                            Administrator
                                                        </>
                                                    ) : (
                                                        <>
                                                            <User className="w-3 h-3 mr-1" />
                                                            Regular User
                                                        </>
                                                    )}
                                                </Badge>
                                                <span className="text-xs text-gray-500">
                                                    {role === "admin" 
                                                        ? "Manage all tickets"
                                                        : "Submit tickets"
                                                    }
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Email Field */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Email Address *
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (errors.email) {
                                                setErrors(prev => ({ ...prev, email: "" }));
                                            }
                                        }}
                                        className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                                    />
                                </div>
                                {errors.email && (
                                    <div className="flex items-center gap-1 text-red-500 text-xs">
                                        <AlertCircle className="w-3 h-3" />
                                        <span>{errors.email}</span>
                                    </div>
                                )}
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Password *
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (errors.password) {
                                                setErrors(prev => ({ ...prev, password: "" }));
                                            }
                                        }}
                                        className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <div className="flex items-center gap-1 text-red-500 text-xs">
                                        <AlertCircle className="w-3 h-3" />
                                        <span>{errors.password}</span>
                                    </div>
                                )}
                                {isRegister && (
                                    <p className="text-xs text-gray-500">
                                        Password must be at least 6 characters long
                                    </p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <Button 
                                    type="submit" 
                                    className="w-full" 
                                    size="lg" 
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                            {isRegister ? "Creating Account..." : "Signing In..."}
                                        </>
                                    ) : (
                                        <>
                                            {isRegister ? (
                                                <>
                                                    <UserPlus className="w-4 h-4 mr-2" />
                                                    Create Account
                                                </>
                                            ) : (
                                                <>
                                                    <LogIn className="w-4 h-4 mr-2" />
                                                    Sign In
                                                </>
                                            )}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>

                    <CardFooter className="flex flex-col">
                        <Separator />
                        <div className="text-center pt-4">
                            <p className="text-sm text-gray-600 mb-2">
                                {isRegister ? "Already have an account?" : "Don't have an account?"}
                            </p>
                            <Button
                                variant="link"
                                onClick={toggleMode}
                                className="p-0 h-auto font-medium text-blue-600 hover:text-blue-700"
                                disabled={loading}
                            >
                                {isRegister ? "Sign in to your account" : "Create a new account"}
                            </Button>
                        </div>
                    </CardFooter>
                </Card>

                {/* Demo Credentials */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-blue-800">Demo Credentials</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="space-y-2 text-sm text-blue-700">
                            <div className="flex justify-between items-center">
                                <span className="font-medium">Admin:</span>
                                <div className="text-right text-xs">
                                    <div>admin@example.com</div>
                                    <div className="text-blue-600">adminpass</div>
                                </div>
                            </div>
                            <Separator className="bg-blue-200" />
                            <div className="flex justify-between items-center">
                                <span className="font-medium">User:</span>
                                <div className="text-right text-xs">
                                    <div>user@example.com</div>
                                    <div className="text-blue-600">userpass</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Login;
