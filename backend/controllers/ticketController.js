const Ticket = require('../models/Ticket');

// Create a new ticket
exports.createTicket = async (req, res) => {
  try {
    const { name, issue, priority } = req.body;

    const ticket = new Ticket({
      user: req.user._id,
      name,
      issue,
      priority
    });

    await ticket.save();

    // Fetch the saved ticket fresh from DB to ensure status is included
    const savedTicket = await Ticket.findById(ticket._id).populate('user', 'name email');

    // Emit socket event for real-time updates
    if (req.io) {
      req.io.emit('ticketCreated', savedTicket);
    }

    res.status(201).json(savedTicket);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all tickets (admin only)
exports.getTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email');
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update ticket status (admin only)
exports.updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!status) return res.status(400).json({ message: 'Status is required' });

    const ticket = await Ticket.findById(req.params.id).populate('user', 'name email');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    ticket.status = status;
    await ticket.save();

    // Fetch updated ticket from DB to ensure all fields are included
    const updatedTicket = await Ticket.findById(ticket._id).populate('user', 'name email');

    // Emit socket event for real-time updates
    if (req.io) {
      req.io.emit('ticketUpdated', updatedTicket);
    }

    res.json(updatedTicket);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get user's own tickets
exports.getUserTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('user', 'name email');
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete user's own ticket
exports.deleteUserTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    // Check if the ticket belongs to the current user
    if (ticket.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own tickets' });
    }
    
    // Prevent deletion of tickets that are being worked on
    if (ticket.status === 'In Progress') {
      return res.status(400).json({ 
        message: 'Cannot delete ticket that is currently being worked on' 
      });
    }
    
    await Ticket.findByIdAndDelete(req.params.id);
    
    // Emit socket event for real-time updates
    if (req.io) {
      req.io.emit('ticketDeleted', { ticketId: req.params.id, userId: req.user._id });
    }
    
    res.json({ message: 'Ticket deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('user', 'name email');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
