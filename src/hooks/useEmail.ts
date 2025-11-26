// src/hooks/useEmail.ts
import { useState } from 'react';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export function useEmail() {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendEmail = async (options: EmailOptions) => {
    setIsSending(true);
    setError(null);
    
    try {
      // Simulate API call
      console.log('Sending email:', options);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      // Log to console instead of sending real email
      console.log('Email would be sent to:', options.to);
      console.log('Subject:', options.subject);
      console.log('Message:', options.text);
      
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send email';
      setError(errorMessage);
      throw err;
    } finally {
      setIsSending(false);
    }
  };

  return { sendEmail, isSending, error };
}