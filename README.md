# Mini Helpdesk App



<p align="center">
  <img src="https://img.shields.io/badge/React-19-blue?logo=react" alt="React 19">
  <img src="https://img.shields.io/badge/Node.js-20.x-green?logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/Express.js-4.x-lightgrey?logo=express" alt="Express.js">
  <img src="https://img.shields.io/badge/MongoDB-6.x-green?logo=mongodb" alt="MongoDB">
  <img src="https://img.shields.io/badge/Socket.IO-4.x-lightgrey?logo=socket.io" alt="Socket.IO">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT">
</p>

A modern, real-time support ticket management system designed to streamline customer support. This demo project showcases a full-stack application built with the MERN stack (MongoDB, Express.js, React, Node.js) and features real-time updates using Socket.IO.

## ✨ Live Demo

[Link to the live demo](mini-helpdesk-app.vercel.app)



## 📚 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [User Roles](#-user-roles)
- [API Endpoints](#-api-endpoints)
- [Troubleshooting](#-troubleshooting)


## 🚀 Features
  
- **Ticket Management**: Users can submit tickets with name, issue description, and priority.
- **Admin Dashboard**: Admins can view, filter, search, and manage all tickets.
- **Status Updates**: Admins can change ticket status (Open → In Progress → Closed).
- **Real-time Updates**: Socket.IO integration for live dashboard updates.
- **Advanced Filtering**: Filter by status, priority, with search functionality.
- **Sorting Options**: Sort by date, priority, status, or name.
- **Statistics Dashboard**: Visual metrics showing ticket counts by status.
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS.
- **Form Validation**: Enhanced form validation with error handling.
- **Toast Notifications**: Real-time success/error notifications.
- **Responsive Design**: Works on desktop and mobile devices.


## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | React 19, React Router DOM, Tailwind CSS, shadcn/ui, Socket.IO Client, Lucide React Icons, Sonner |
| **Backend** | Node.js, Express.js, MongoDB with Mongoose, Socket.IO, JWT, bcrypt |
| **Database** | MongoDB |
| **DevOps** | npm, Vite |

## 📂 Project Structure


  
```
Mini-Helpdesk-App/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── .env
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── contexts/
    │   ├── pages/
    │   ├── App.jsx
    │   └── main.jsx
    └── vite.config.js
```

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd Mini-Helpdesk-App
```

### 2. Setup the Backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory and add the following:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/helpdesk
JWT_SECRET=your_jwt_secret_key_here
```

### 3. Setup the Frontend
```bash
cd ../frontend
npm install
```

### 4. Run the Application
**Backend:**
```bash
cd backend
npm start
```
**Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Access the Application
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

## 👥 User Roles


  
### Regular User
- Submit new support tickets.
- View their own tickets (future feature).
- Set priority levels (High, Medium, Low).

### Admin User
- View all tickets in the dashboard.
- Filter and search tickets.
- Update ticket status.
- View ticket statistics.
- Real-time notifications for new tickets.


## 📝 API Endpoints

  
### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Tickets
- `GET /api/tickets` - Get all tickets (Admin only)
- `POST /api/tickets` - Create new ticket
- `PATCH /api/tickets/:id/status` - Update ticket status (Admin only)
- `GET /api/tickets/:id` - Get specific ticket


