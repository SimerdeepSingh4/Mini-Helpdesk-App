import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { Clock, User, AlertCircle } from "lucide-react";

const TicketCard = ({ ticket, onStatusChange }) => {
  const { name, issue, priority, status, _id, user, createdAt } = ticket;

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

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <User className="w-5 h-5" />
            {name}
          </CardTitle>
          <div className="flex gap-2">
            <Badge className={`text-white ${getPriorityColor(priority)}`}>
              <AlertCircle className="w-3 h-3 mr-1" />
              {priority}
            </Badge>
            <Badge className={`text-white ${getStatusColor(status)}`}>
              {status}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div>
            <h4 className="font-medium mb-1">Issue Description</h4>
            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
              {issue}
            </p>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {new Date(createdAt).toLocaleString()}
            </div>
            
            <Select value={status} onValueChange={(value) => onStatusChange(_id, value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketCard;