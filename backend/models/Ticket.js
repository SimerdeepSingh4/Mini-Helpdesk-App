const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    issue: { type: String, required: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
    status: { type: String, enum: ['Open', 'In Progress', 'Closed'], default: 'Open' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ticket', TicketSchema);
