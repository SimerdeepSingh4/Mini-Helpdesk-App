import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useSocket } from "../contexts/SocketContext";
import TicketCard from "../components/TicketCard";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { Search, Filter, Ticket, Clock, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

const AdminDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const { socket, connected } = useSocket();

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/tickets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(res.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching tickets");
      setLoading(false);
      toast.error("Failed to fetch tickets");
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Socket.IO real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleTicketCreated = (newTicket) => {
      setTickets(prev => [newTicket, ...prev]);
      toast.success(`New ticket created by ${newTicket.name}`);
    };

    const handleTicketUpdated = (updatedTicket) => {
      setTickets(prev => 
        prev.map(ticket => 
          ticket._id === updatedTicket._id ? updatedTicket : ticket
        )
      );
      toast.info(`Ticket status updated to ${updatedTicket.status}`);
    };

    socket.on('ticketCreated', handleTicketCreated);
    socket.on('ticketUpdated', handleTicketUpdated);

    return () => {
      socket.off('ticketCreated', handleTicketCreated);
      socket.off('ticketUpdated', handleTicketUpdated);
    };
  }, [socket]);

  // Filter and search functionality
  useEffect(() => {
    let filtered = [...tickets];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(ticket => 
        ticket.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
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
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
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

  const handleStatusChange = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:5000/api/tickets/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Ticket status updated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Error updating status");
      toast.error("Failed to update ticket status");
    }
  };

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

  if (loading) return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p className="text-lg">Loading tickets...</p>
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
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${
              connected ? "bg-green-500" : "bg-red-500"
            }`}></div>
            {connected ? "Connected" : "Disconnected"} • Real-time updates enabled
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
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open</CardTitle>
              <AlertCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.open}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Closed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.closed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, issue, or email..."
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
                  <SelectItem value="name">Name</SelectItem>
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
                    ? "No tickets have been created yet."
                    : "Try adjusting your search or filter criteria."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTickets.map((ticket) => (
              <TicketCard
                key={ticket._id}
                ticket={ticket}
                onStatusChange={handleStatusChange}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
