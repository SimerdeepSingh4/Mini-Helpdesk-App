import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useSocket } from "../contexts/SocketContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { 
  Search, 
  Filter, 
  Ticket, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  User,
  Calendar,
  TrendingUp,
  Eye,
  Trash2,
  AlertTriangle
} from "lucide-react";

const UserDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [deletingTicketId, setDeletingTicketId] = useState(null);
  const { socket, connected } = useSocket();

  const fetchMyTickets = async () => {
    try {
      const token = localStorage.getItem("token");
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await axios.get(`${API_URL}/api/tickets/my-tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(res.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching tickets");
      setLoading(false);
      toast.error("Failed to fetch your tickets");
    }
  };

  useEffect(() => {
    fetchMyTickets();
  }, []);

  // Socket.IO real-time updates for user's own tickets
  useEffect(() => {
    if (!socket) return;

    const handleTicketCreated = (newTicket) => {
      const user = JSON.parse(localStorage.getItem("user"));
      // Only add if it's the current user's ticket
      if (newTicket.user._id === user.id || newTicket.user === user.id) {
        setTickets(prev => [newTicket, ...prev]);
        toast.success("Your new ticket has been created!");
      }
    };

    const handleTicketUpdated = (updatedTicket) => {
      const user = JSON.parse(localStorage.getItem("user"));
      // Only update if it's the current user's ticket
      if (updatedTicket.user._id === user.id || updatedTicket.user === user.id) {
        setTickets(prev => 
          prev.map(ticket => 
            ticket._id === updatedTicket._id ? updatedTicket : ticket
          )
        );
        toast.info(`Your ticket status updated to ${updatedTicket.status}`);
      }
    };

    const handleTicketDeleted = (data) => {
      const user = JSON.parse(localStorage.getItem("user"));
      // Only remove if it's the current user's ticket
      if (data.userId === user.id) {
        setTickets(prev => prev.filter(ticket => ticket._id !== data.ticketId));
        toast.success("Ticket deleted successfully");
      }
    };

    socket.on('ticketCreated', handleTicketCreated);
    socket.on('ticketUpdated', handleTicketUpdated);
    socket.on('ticketDeleted', handleTicketDeleted);

    return () => {
      socket.off('ticketCreated', handleTicketCreated);
      socket.off('ticketUpdated', handleTicketUpdated);
      socket.off('ticketDeleted', handleTicketDeleted);
    };
  }, [socket]);

  // Filter and search functionality
  useEffect(() => {
    let filtered = [...tickets];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(ticket => 
        ticket.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.priority.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== "All") {
      filtered = filtered.filter(ticket => ticket.priority === priorityFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "createdAt":
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case "priority":
          const priorityOrder = { "High": 3, "Medium": 2, "Low": 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (sortOrder === "desc") {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

    setFilteredTickets(filtered);
  }, [tickets, searchTerm, statusFilter, priorityFilter, sortBy, sortOrder]);

  // Statistics calculations
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === "Open").length,
    inProgress: tickets.filter(t => t.status === "In Progress").length,
    closed: tickets.filter(t => t.status === "Closed").length
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setPriorityFilter("All");
    setSortBy("createdAt");
    setSortOrder("desc");
  };

  const handleDeleteTicket = async (ticketId) => {
    try {
      setDeletingTicketId(ticketId);
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/tickets/my-tickets/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Remove ticket from state immediately (optimistic update)
      setTickets(prev => prev.filter(ticket => ticket._id !== ticketId));
      toast.success("Ticket deleted successfully");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Error deleting ticket";
      toast.error(errorMessage);
      console.error("Delete ticket error:", err);
    } finally {
      setDeletingTicketId(null);
    }
  };

  const canDeleteTicket = (ticket) => {
    // Users can delete tickets that are "Open" or "Closed", but not "In Progress"
    return ticket.status !== "In Progress";
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-500 hover:bg-red-600";
      case "Medium":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "Low":
        return "bg-green-500 hover:bg-green-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "bg-blue-500 hover:bg-blue-600";
      case "In Progress":
        return "bg-orange-500 hover:bg-orange-600";
      case "Closed":
        return "bg-green-500 hover:bg-green-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const user = JSON.parse(localStorage.getItem("user"));

  if (loading) return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p className="text-lg">Loading your tickets...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <p className="text-center text-red-500 text-lg">{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Tickets</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Welcome, {user?.name}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    connected ? "bg-green-500" : "bg-red-500"
                  }`}></div>
                  {connected ? "Connected" : "Disconnected"} • Real-time updates
                </div>
              </div>
            </div>
            <Button onClick={fetchMyTickets} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                All your tickets
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open</CardTitle>
              <AlertCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.open}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting response
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">
                Being worked on
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.closed}</div>
              <p className="text-xs text-muted-foreground">
                Completed tickets
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter & Search Your Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by issue, priority, status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Priority</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Date Created</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Showing {filteredTickets.length} of {tickets.length} tickets
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
              >
                Sort {sortOrder === "desc" ? "↓" : "↑"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tickets List */}
        <div className="space-y-4">
          {filteredTickets.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Ticket className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tickets found</h3>
                <p className="text-muted-foreground text-center">
                  {tickets.length === 0 
                    ? "You haven't created any tickets yet. Submit your first ticket to get started!"
                    : "Try adjusting your search or filter criteria."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTickets.map((ticket) => (
              <Card key={ticket._id} className="w-full">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Ticket className="w-5 h-5" />
                      Ticket #{ticket._id.slice(-6).toUpperCase()}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-2">
                        <Badge className={`text-white ${getPriorityColor(ticket.priority)}`}>
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {ticket.priority}
                        </Badge>
                        <Badge className={`text-white ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </Badge>
                      </div>
                      
                      {/* Delete Button */}
                      {canDeleteTicket(ticket) && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                              disabled={deletingTicketId === ticket._id}
                            >
                              {deletingTicketId === ticket._id ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                Delete Ticket
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this ticket? This action cannot be undone.
                                <div className="mt-3 p-3 bg-gray-50 rounded border-l-4 border-red-500">
                                  <p className="text-sm font-medium text-gray-800">Ticket #{ticket._id.slice(-6).toUpperCase()}</p>
                                  <p className="text-sm text-gray-600 mt-1">{ticket.issue.slice(0, 100)}...</p>
                                  <p className="text-xs text-gray-500 mt-1">Priority: {ticket.priority} • Status: {ticket.status}</p>
                                </div>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteTicket(ticket._id)}
                                className="bg-red-500 hover:bg-red-600 text-white"
                              >
                                Delete Ticket
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                      
                      {/* Show why ticket can't be deleted */}
                      {!canDeleteTicket(ticket) && (
                        <div className="relative group">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled
                            className="text-gray-400 border-gray-200 cursor-not-allowed"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <div className="absolute right-0 top-full mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            Cannot delete tickets in progress
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-1">Issue Description</h4>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border-l-4 border-blue-500">
                        {ticket.issue}
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Created: {new Date(ticket.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(ticket.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <TrendingUp className="w-3 h-3" />
                        Last updated: {new Date(ticket.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Empty state for new users */}
        {tickets.length === 0 && (
          <div className="mt-8 text-center">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="py-8">
                <Ticket className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-blue-800 mb-2">
                  Ready to submit your first ticket?
                </h3>
                <p className="text-blue-600 mb-4">
                  Get help with any issues or questions you have. Our support team is here to assist you.
                </p>
                <Button 
                  onClick={() => window.location.href = '/ticket'}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Ticket className="w-4 h-4 mr-2" />
                  Submit New Ticket
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;