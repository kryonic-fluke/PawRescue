# Backend Setup Guide

## Overview
This application now has a complete backend Express server (`server.js`) that handles all API requests. The frontend (Vite) runs on port 3000 and proxies API requests to the backend on port 3001.

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌──────────────┐
│                 │         │                  │         │              │
│  Frontend       │  :3000  │  Vite Proxy      │  :3001  │  Backend     │
│  (React + Vite) │────────▶│  /api/* ────────▶│────────▶│  (Express)   │
│                 │         │                  │         │              │
└─────────────────┘         └──────────────────┘         └──────────────┘
                                                                  │
                                                                  ▼
                                                          ┌──────────────┐
                                                          │   Database   │
                                                          │   (Turso)    │
                                                          └──────────────┘
```

## Running the Application

### Option 1: Run Both Servers Together (Recommended)
```bash
npm run dev
```

This command runs both the backend server and frontend dev server simultaneously using `concurrently`.

### Option 2: Run Servers Separately

**Terminal 1 - Backend Server:**
```bash
npm run dev:backend
```

**Terminal 2 - Frontend Dev Server:**
```bash
npm run dev:frontend
```

## Backend API Endpoints

All API routes are available at `http://localhost:3000/api/*` (automatically proxied to port 3001)

### Rescue Reports
- **GET** `/api/rescue-reports-new?limit=100` - Get all rescue reports
- **POST** `/api/rescue-reports-new` - Create new rescue report
  ```json
  {
    "animalType": "Dog",
    "description": "Injured dog found...",
    "location": "New Delhi, India",
    "urgency": "high",
    "phone": "+91 98765 43210",
    "email": "reporter@email.com",
    "status": "pending"
  }
  ```
- **PUT** `/api/rescue-reports-new?id=1` - Update rescue report
- **DELETE** `/api/rescue-reports-new?id=1` - Delete rescue report

### Animals/Pets
- **GET** `/api/pets?limit=100` - Get all animals
- **POST** `/api/pets` - Add new animal
- **PUT** `/api/pets?id=1` - Update animal
- **DELETE** `/api/pets?id=1` - Delete animal

### Team Members
- **GET** `/api/team-members-new?limit=100` - Get all team members

### Adoption Applications
- **GET** `/api/adoption-applications-new?limit=100` - Get all adoption applications

### WhatsApp Messages
- **GET** `/api/whatsapp-messages?chatRoomId=room123` - Get messages for a chat room
- **POST** `/api/whatsapp-messages` - Send new message
  ```json
  {
    "senderPhone": "+91 98765 43210",
    "receiverPhone": "+91 98765 43211",
    "senderName": "John Doe",
    "receiverName": "NGO Name",
    "messageText": "Hello, I need help...",
    "chatRoomId": "user-ngo",
    "messageType": "text"
  }
  ```

### NGOs & Shelters
- **GET** `/api/ngos` - Get all NGOs
- **GET** `/api/animal-shelters` - Get all animal shelters

### Health Check
- **GET** `/api/health` - Check if backend is running

## Authentication

All API routes (except `/api/health`) require authentication. The backend validates the bearer token from the `Authorization` header:

```javascript
const token = localStorage.getItem("bearer_token");

fetch("/api/rescue-reports-new", {
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  }
})
```

## Database

The backend uses:
- **Drizzle ORM** for database operations
- **Turso (LibSQL)** as the database
- **Better Auth** for authentication

Database schema is located in `src/db/schema.ts`

## Environment Variables

Required environment variables (already set up in `.env`):
```env
TURSO_DATABASE_URL=your_database_url
TURSO_AUTH_TOKEN=your_auth_token
BETTER_AUTH_SECRET=your_secret
BETTER_AUTH_URL=http://localhost:3000
```

## Fixed Issues

### 1. **Authentication Redirects Removed**
- Settings page no longer redirects to login
- Messages page no longer redirects to login  
- NGO Dashboard no longer redirects to login

### 2. **Backend Integration Complete**
- All API routes now work properly
- NGO Dashboard loads rescue reports correctly
- Messages page loads contacts and sends messages
- Data export functionality works

### 3. **Proper API Structure**
- Vite proxy configuration routes all `/api/*` requests to backend
- Express server handles authentication and database operations
- Proper error handling and response formatting

## Troubleshooting

### Port Already in Use
If port 3001 is already in use, you can change it in `server.js`:
```javascript
const port = process.env.PORT || 3001; // Change 3001 to another port
```

### Database Connection Issues
Check your `.env` file has correct Turso credentials:
```bash
# Verify environment variables
cat .env
```

### Backend Not Starting
Check if all dependencies are installed:
```bash
npm install
```

### API Requests Failing
1. Make sure backend server is running on port 3001
2. Check browser console for errors
3. Verify bearer token exists in localStorage
4. Check backend terminal for error logs

## Development Tips

### Viewing Backend Logs
The backend server logs all incoming requests:
```
[Proxy] GET /api/rescue-reports-new -> http://localhost:3001/api/rescue-reports-new
```

### Testing API Endpoints
You can test endpoints directly using curl:
```bash
# Get rescue reports (requires valid token)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/rescue-reports-new

# Health check (no auth required)
curl http://localhost:3001/api/health
```

### Database Management
Access your database through the Database Studio tab in the UI (top right, next to Analytics).

## Next Steps

1. ✅ Backend server running
2. ✅ Authentication fixed
3. ✅ API routes working
4. ✅ Settings page accessible
5. ✅ Messages page accessible
6. ✅ NGO Dashboard accessible

Your application is now fully functional with a complete backend!
