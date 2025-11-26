// scripts/test-email.ts
import dotenv from 'dotenv';
dotenv.config({ path: '.env', debug: true });

console.log('Resend API Key:', process.env.RESEND_API_KEY ? 'Set' : 'Not set');
console.log('From Email:', process.env.NEXT_PUBLIC_RESEND_FROM_EMAIL);

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.NEXT_PUBLIC_RESEND_FROM_EMAIL!,
      to: 'rishabhshan7@gmail.com', // Your verified email
      subject: 'Test Email from PawRescue',
      html: '<strong>Hello from PawRescue! This is a test email.</strong>',
    });

    if (error) {
      console.error('Error sending email:', error);
      return;
    }

    console.log('Email sent successfully:', data);
  } catch (error) {
    console.error('Failed to send test email:', error);
  }
}

testEmail();