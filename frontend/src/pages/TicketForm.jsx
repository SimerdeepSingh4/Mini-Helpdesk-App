// src/pages/TicketForm.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const TicketForm = () => {
    const [name, setName] = useState("");
    const [issue, setIssue] = useState("");
    const [priority, setPriority] = useState("High");
    const [message, setMessage] = useState("");

    // Populate name from localStorage (logged-in user)
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) setName(user.name);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");

            const res = await axios.post(
                "http://localhost:5000/api/tickets",
                { name, issue, priority },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMessage("Ticket submitted successfully!");
            setIssue(""); // clear form
            setPriority("High");
        } catch (err) {
            const data = err.response?.data;
            if (data?.errors && Array.isArray(data.errors)) {
                setMessage(data.errors.map(e => e.msg).join(" | "));
            } else {
                setMessage(data?.message || "Error submitting ticket");
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Submit Ticket</h2>

                {message && <p className="text-green-500 mb-4">{message}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium">Name</label>
                        <input
                            type="text"
                            value={name}
                            readOnly
                            className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Issue</label>
                        <textarea
                            value={issue}
                            onChange={(e) => setIssue(e.target.value)}
                            required
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Priority</label>
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
                    >
                        Submit Ticket
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TicketForm;
