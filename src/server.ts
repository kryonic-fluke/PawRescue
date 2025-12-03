
import * as dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
}

import express from 'express';
import cors from 'cors';
import path from 'path';
// Necessary imports for ESM path handling logic
import { fileURLToPath } from 'url';

import aiChatRouter from './app/api/ai-feature/ai-chat.js';
import apiRouter from './app/api/index.js';  
import reportsRouter from './app/api/reports.js';

const app = express();


const PORT = process.env.PORT || 3001;

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

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mode: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api', apiRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/ai-chat', aiChatRouter);


if (process.env.NODE_ENV === 'production') {
  // ESM-safe way to get __dirname
  // const __filename = fileURLToPath(import.meta.url);
  // // const __dirname = path.dirname(__filename)
  
 
  const clientDistPath = path.resolve(process.cwd(), 'dist'); 
  
  app.use(express.static(clientDistPath));

  app.get('*', (_req, res) => {
    // If not an API route, send index.html
    if (!_req.path.startsWith('/api')) {
       res.sendFile(path.join(clientDistPath, 'index.html'));
    }
  });
}

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    // Hide details in production for security
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app;


const isMainModule = process.argv[1] === fileURLToPath(import.meta.url) || 
                     process.env.NODE_ENV !== 'production';

if (isMainModule) {
  const server = app.listen(PORT, () => {
    console.log(`\n🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`🔌 Port: ${PORT}`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/health\n`);
  });

  process.on('unhandledRejection', (err: Error) => {
    console.error('❌ Unhandled Rejection:', err);
    server.close(() => process.exit(1));
  });
}