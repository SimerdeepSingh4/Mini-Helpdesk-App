// src/pages/Login.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = ({ onLogin }) => {
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("user"); // default role
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let res;
            if (isRegister) {
                // Register API
                res = await axios.post("http://localhost:5000/api/auth/register", {
                    name,
                    email,
                    password,
                    role, // 'user' or 'admin'
                });
            } else {
                // Login API
                res = await axios.post("http://localhost:5000/api/auth/login", {
                    email,
                    password,
                });
            }

            // Save token and user info
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));

            // Notify parent (App.jsx) to update user state
            if (typeof onLogin === "function") onLogin();

            // Redirect based on role
            if (res.data.user.role === "admin") {
                navigate("/dashboard");
            } else {
                navigate("/ticket");
            }
        } catch (err) {
            // Show validation errors if present
            const data = err.response?.data;
            if (data?.errors && Array.isArray(data.errors)) {
                setError(data.errors.map(e => e.msg).join(" | "));
            } else {
                setError(data?.message || "Error occurred");
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">
                    {isRegister ? "Register" : "Login"}
                </h2>

                {error && <p className="text-red-500 mb-4">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegister && (
                        <>
                            <div>
                                <label className="block mb-1 font-medium">Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block mb-1 font-medium">Role</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block mb-1 font-medium">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
                    >
                        {isRegister ? "Register" : "Login"}
                    </button>
                </form>

                <p className="mt-4 text-center text-gray-600">
                    {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
                    <span
                        className="text-blue-500 cursor-pointer"
                        onClick={() => {
                            setIsRegister(!isRegister);
                            setError("");
                        }}
                    >
                        {isRegister ? "Login" : "Register"}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Login;
