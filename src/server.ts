// src/server.ts
// CRITICAL: Load environment variables FIRST
// import './config/env-loader';  <-- COMMENTED OUT FOR VERCEL
// Now import everything else AFTER env is loaded

import express from 'express';
import cors from 'cors';
import path from 'path';
import aiChatRouter from './app/api/ai-feature/ai-chat.js';
import apiRouter from './app/api/index.js';  

import reportsRouter from './app/api/reports.js';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
 origin: [
    'http://localhost:5173', 
    'http://localhost:3000', 
    process.env.FRONTEND_URL || ''
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api', apiRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/ai-chat', aiChatRouter
);
// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  // Path to the Vite build output
  const clientDistPath = path.join(process.cwd(), 'dist', 'client');
  const indexHtmlPath = path.join(clientDistPath, 'index.html');

  // Serve static files
  app.use(express.static(clientDistPath));

  // Handle client-side routing, return all requests to React app
  app.get('*', (_req, res) => {
    res.sendFile(indexHtmlPath);
  });
}

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app;

// Start server
if (process.env.NODE_ENV !== 'production') {
  
  const server = app.listen(PORT, () => {
    console.log('\n🚀 Server started successfully!');
    console.log(`📍 Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Server: http://localhost:${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api`);
    console.log(`💚 Health: http://localhost:${PORT}/health\n`);
  });

  // Handle unhandled promise rejections (Only needed when running locally)
  process.on('unhandledRejection', (err: Error) => {
    console.error('❌ Unhandled Rejection:', err);
    server.close(() => process.exit(1));
  });
}