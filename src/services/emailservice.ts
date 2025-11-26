import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { env } from '../config/env';

// Types for email options
interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  from?: string;
}

// Initialize email clients
let transporter: any = null;
let resendClient: any = null;

// Configure email transport based on environment
if (env.NODE_ENV === 'production') {
  if (env.EMAIL_PROVIDER === 'sendgrid') {
    resendClient = new Resend(env.SENDGRID_API_KEY);
  } else {
    // SMTP configuration
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE, // true for 465, false for other ports
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD,
      },
    });
  }
}

/**
 * Sends an email using the configured email provider
 * Falls back to console.log in development
 */
const sendEmail = async (options: EmailOptions): Promise<void> => {
  const { to, subject, text, html, from } = {
    from: env.EMAIL_FROM || 'noreply@pawrescue.org',
    ...options,
  };

  // In development, just log the email
  if (env.NODE_ENV !== 'production') {
    console.log('\n--- EMAIL NOT SENT (Development Mode) ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('---\n' + text + '\n---\n');
    return;
  }

  try {
    if (env.EMAIL_PROVIDER === 'sendgrid' && resendClient) {
      // Send with SendGrid
      await resendClient.emails.send({
        from,
        to,
        subject,
        text,
        html: html || text.replace(/\n/g, '<br>'),
      });
    } else if (transporter) {
      // Send with SMTP
      await transporter.sendMail({
        from,
        to,
        subject,
        text,
        html: html || text,
      });
    } else {
      throw new Error('No email transport configured');
    }
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Failed to send email');
  }
};

// Export the sendEmail function as default
export default sendEmail;

/**
 * Sends an adoption confirmation email
 */
export async function sendAdoptionConfirmation(
  email: string,
  adoptionId: string,
  petName: string
): Promise<void> {
  const receiptUrl = `${env.FRONTEND_URL}/adoptions/${adoptionId}/receipt`;
  
  await sendEmail({
    to: email,
    subject: `Adoption Application Received - ${petName}`,
    text: `Thank you for your adoption application for ${petName}!\n\n` +
          `Your application ID is: ${adoptionId}\n` +
          `You can download your receipt here: ${receiptUrl}\n\n` +
          'The shelter will review your application and contact you soon with next steps.\n\n' +
          'Thank you for choosing to adopt! 🐾',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Adoption Application Received</h2>
        <p>Thank you for your adoption application for <strong>${petName}</strong>!</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Application ID:</strong> ${adoptionId}</p>
          <p><a href="${receiptUrl}" style="color: #0066cc;">Download Receipt</a></p>
        </div>
        
        <p>The shelter will review your application and contact you soon with next steps.</p>
        <p>Thank you for choosing to adopt! 🐾</p>
      </div>
    `,
  });
}

/**
 * Sends a notification to the shelter about a new adoption application
 */
export async function notifyShelterOfAdoption(
  shelterEmail: string,
  petName: string,
  applicationId: string,
  applicantName: string,
  applicantEmail: string,
  applicantPhone: string,
  message?: string
): Promise<void> {
  const adminUrl = `${env.ADMIN_URL}/adoptions/${applicationId}`;
  
  await sendEmail({
    to: shelterEmail,
    subject: `New Adoption Application - ${petName}`,
    text: `A new adoption application has been submitted for ${petName}.\n\n` +
          `Applicant: ${applicantName}\n` +
          `Email: ${applicantEmail}\n` +
          `Phone: ${applicantPhone}\n` +
          `Application ID: ${applicationId}\n\n` +
          `${message ? `Message from applicant:\n${message}\n\n` : ''}` +
          `View the application: ${adminUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Adoption Application</h2>
        <p>A new adoption application has been submitted for <strong>${petName}</strong>.</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Applicant:</strong> ${applicantName}</p>
          <p><strong>Email:</strong> ${applicantEmail}</p>
          <p><strong>Phone:</strong> ${applicantPhone}</p>
          <p><strong>Application ID:</strong> ${applicationId}</p>
          ${message ? `<p><strong>Message from applicant:</strong><br>${message.replace(/\n/g, '<br>')}</p>` : ''}
        </div>
        
        <p><a href="${adminUrl}" style="display: inline-block; padding: 10px 20px; background: #0066cc; color: white; text-decoration: none; border-radius: 5px;">View Application</a></p>
      </div>
    `,
  });
}

/**
 * Sends a pet alert to a user when a matching pet is available
 */
export async function sendPetAlert(
  email: string,
  petName: string,
  petSpecies: string,
  petBreed: string,
  petLocation: string,
  petImageUrl?: string,
  petUrl?: string
): Promise<void> {
  await sendEmail({
    to: email,
    subject: `🐾 New ${petSpecies} Available for Adoption: ${petName}`,
    text: `A new ${petSpecies} matching your criteria is now available for adoption!\n\n` +
          `Name: ${petName}\n` +
          `Breed: ${petBreed}\n` +
          `Location: ${petLocation}\n\n` +
          `${petUrl ? `View ${petName}'s profile: ${petUrl}` : ''}\n\n` +
          'Hurry, pets like this get adopted quickly!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>🐾 New ${petSpecies} Available: ${petName}</h2>
        <p>A new ${petSpecies} matching your criteria is now available for adoption!</p>
        
        <div style="margin: 20px 0; ${petImageUrl ? 'display: flex; gap: 20px;' : ''}">
          ${petImageUrl ? `
            <div style="flex: 0 0 200px;">
              <img src="${petImageUrl}" alt="${petName}" style="max-width: 100%; border-radius: 5px;">
            </div>
          ` : ''}
          <div>
            <p><strong>Name:</strong> ${petName}</p>
            <p><strong>Breed:</strong> ${petBreed}</p>
            <p><strong>Location:</strong> ${petLocation}</p>
          </div>
        </div>
        
        ${petUrl ? `
          <p><a href="${petUrl}" style="display: inline-block; padding: 10px 20px; background: #0066cc; color: white; text-decoration: none; border-radius: 5px;">View ${petName}'s Profile</a></p>
        ` : ''}
        
        <p style="color: #666; font-size: 0.9em; margin-top: 30px;">Hurry, pets like this get adopted quickly!</p>
      </div>
    `,
  });
}

/**
 * Sends a contact form submission to the admin
 */
export async function sendContactFormEmail({
  name,
  email,
  message,
  subject = 'New Contact Form Submission',
}: {
  name: string;
  email: string;
  message: string;
  subject?: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@pawrescue.org';
  const text = `
    You've received a new contact form submission:
    
    Name: ${name}
    Email: ${email}
    Message: ${message}
  `;

  return sendEmail({
    to: adminEmail,
    subject: subject,
    text: text.trim(),
    html: `
      <div>
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      </div>
    `,
  });
}

/**
 * Tests the email service by sending a test email
 */
export async function testEmailService() {
  try {
    console.log('Testing email service...');
    await sendEmail({
      to: 'test@example.com',
      subject: 'Test Email from PawRescue',
      text: 'This is a test email from PawRescue.'
    });
    console.log('Email sent successfully!');
  } catch (error) {
    console.error('Error sending test email:', error);
    throw error;
  }
}