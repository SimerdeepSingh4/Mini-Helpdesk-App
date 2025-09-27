// src/pages/TicketForm.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Ticket, User, AlertCircle, Send, CheckCircle2, Home } from "lucide-react";

const TicketForm = () => {
    const [name, setName] = useState("");
    const [issue, setIssue] = useState("");
    const [priority, setPriority] = useState("Medium");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

    // Populate name from localStorage (logged-in user)
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) setName(user.name);
    }, []);

    // Form validation
    const validateForm = () => {
        const newErrors = {};
        
        if (!issue.trim()) {
            newErrors.issue = "Issue description is required";
        } else if (issue.length < 10) {
            newErrors.issue = "Issue description must be at least 10 characters";
        }
        
        if (!priority) {
            newErrors.priority = "Priority is required";
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
        setMessage("");
        
        try {
            const token = localStorage.getItem("token");
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

            const res = await axios.post(
                `${API_URL}/api/tickets`,
                { name, issue, priority },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSubmitted(true);
            setMessage("Ticket submitted successfully!");
            toast.success("Ticket submitted successfully!");
            
            // Clear form
            setIssue("");
            setPriority("Medium");
            setErrors({});
            
            // Reset submitted state and redirect to dashboard
            setTimeout(() => {
                setSubmitted(false);
                setMessage("");
                navigate('/my-tickets');
            }, 2500);
            
        } catch (err) {
            const data = err.response?.data;
            if (data?.errors && Array.isArray(data.errors)) {
                const errorMsg = data.errors.map(e => e.msg).join(" | ");
                setMessage(errorMsg);
                toast.error(errorMsg);
            } else {
                const errorMsg = data?.message || "Error submitting ticket";
                setMessage(errorMsg);
                toast.error(errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };
    
    const getPriorityColor = (priority) => {
        switch (priority) {
            case "High":
                return "bg-red-100 text-red-800 border-red-200";
            case "Medium":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "Low":
                return "bg-green-100 text-green-800 border-green-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const user = JSON.parse(localStorage.getItem("user"));

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-2xl mx-auto">
                {/* Breadcrumb */}
                {/* <div className="mb-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Home className="w-4 h-4" />
                        <span>Home</span>
                        <span>/</span>
                        <Ticket className="w-4 h-4" />
                        <span>Submit Ticket</span>
                    </div>
                </div> */}

                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold mb-2">Submit Support Ticket</h1>
                    <p className="text-muted-foreground">Describe your issue and we'll get back to you soon</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Ticket className="w-5 h-5" />
                            New Support Request
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Success Message */}
                        {submitted && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                <div>
                                    <p className="text-green-800 font-medium">{message}</p>
                                    <p className="text-green-700 text-sm">Redirecting to your tickets dashboard...</p>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {message && !submitted && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-800">{message}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* User Information */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Submitted By</label>
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                                    <User className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium">{name}</span>
                                    <Badge variant="secondary" className="ml-auto">
                                        {user?.role === 'admin' ? 'Administrator' : 'User'}
                                    </Badge>
                                </div>
                            </div>

                            <Separator />

                            {/* Issue Description */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Issue Description *
                                </label>
                                <Textarea
                                    placeholder="Please describe your issue in detail..."
                                    value={issue}
                                    onChange={(e) => {
                                        setIssue(e.target.value);
                                        if (errors.issue) {
                                            setErrors(prev => ({ ...prev, issue: "" }));
                                        }
                                    }}
                                    className={`min-h-[120px] ${errors.issue ? 'border-red-500 focus:ring-red-500' : ''}`}
                                    disabled={loading || submitted}
                                />
                                {errors.issue && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.issue}
                                    </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                    Characters: {issue.length} (minimum 10 required)
                                </p>
                            </div>

                            {/* Priority Selection */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Priority Level *
                                </label>
                                <Select 
                                    value={priority} 
                                    onValueChange={(value) => {
                                        setPriority(value);
                                        if (errors.priority) {
                                            setErrors(prev => ({ ...prev, priority: "" }));
                                        }
                                    }}
                                    disabled={loading || submitted}
                                >
                                    <SelectTrigger className={errors.priority ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select priority level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Low">Low Priority</SelectItem>
                                        <SelectItem value="Medium">Medium Priority</SelectItem>
                                        <SelectItem value="High">High Priority</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.priority && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.priority}
                                    </p>
                                )}
                                
                                {/* Priority Description */}
                                {priority && (
                                    <div className="mt-2">
                                        <Badge className={`${getPriorityColor(priority)}`}>
                                            {priority} Priority
                                        </Badge>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {priority === "High" && "Critical issues requiring immediate attention"}
                                            {priority === "Medium" && "Important issues that should be addressed soon"}
                                            {priority === "Low" && "General inquiries and minor issues"}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
                                <Button 
                                    type="submit" 
                                    className="w-full" 
                                    disabled={loading || submitted}
                                    size="lg"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                            Submitting...
                                        </>
                                    ) : submitted ? (
                                        <>
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                            Submitted Successfully
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            Submit Ticket
                                        </>
                                    )}
                                </Button>
                            </div>
                            
                            {!submitted && (
                                <p className="text-xs text-muted-foreground text-center">
                                    Your ticket will be visible in "My Tickets" after submission
                                </p>
                            )}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default TicketForm;
