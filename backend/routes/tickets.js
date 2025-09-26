const express = require('express');
const { body } = require('express-validator');
const { createTicket, getTickets, updateTicketStatus, getTicketById, getUserTickets, deleteUserTicket } = require('../controllers/ticketController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Validation for creating ticket
const validateTicket = [
  body('name').notEmpty().withMessage('Name is required'),
  body('issue').notEmpty().withMessage('Issue is required'),
  body('priority').isIn(['Low', 'Medium', 'High']).withMessage('Priority must be Low, Medium, or High')
];

// Routes
router.post('/', protect, validateTicket, createTicket);
router.get('/', protect, admin, getTickets); // admin sees all tickets
router.get('/my-tickets', protect, getUserTickets); // user sees their own tickets
router.delete('/my-tickets/:id', protect, deleteUserTicket); // user can delete their own tickets
router.patch('/:id/status', protect, admin, updateTicketStatus);
router.get('/:id', protect, getTicketById);

module.exports = router;
