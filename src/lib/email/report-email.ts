// src/lib/email/report-email.ts
import { Resend } from 'resend';
import { Report } from '@/lib/db/reports';

// Make Resend optional - only initialize if API key is present
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

if (!resend) {
  console.warn('⚠️ RESEND_API_KEY not set - email notifications will be disabled');
}

interface SendReportEmailParams {
  to: string;
  report: Report;
  reportId: string;
}

export async function sendReportEmail({ to, report, reportId }: SendReportEmailParams) {
  // Skip if Resend is not configured
  if (!resend) {
    console.log('📧 Email notifications disabled - skipping email to:', to);
    return { success: false, message: 'Email service not configured' };
  }

  try {
    const data = await resend.emails.send({
      from: 'PawRescue <onboarding@resend.dev>',
      to: [to],
      subject: `New Animal Report - ${report.animal_type} in ${report.location}`,
      html: `
        <h1>New Animal Report</h1>
        <p><strong>Report ID:</strong> ${reportId}</p>
        <p><strong>Animal Type:</strong> ${report.animal_type}</p>
        <p><strong>Breed:</strong> ${report.breed || 'Not specified'}</p>
        <p><strong>Color:</strong> ${report.color || 'Not specified'}</p>
        <p><strong>Location:</strong> ${report.location}, ${report.city}</p>
        <p><strong>Description:</strong> ${report.description}</p>
        <p><strong>Urgency:</strong> ${report.urgency}</p>
        <p><strong>Has Injuries:</strong> ${report.has_injuries ? 'Yes' : 'No'}</p>
        ${report.has_injuries ? `<p><strong>Injuries:</strong> ${report.injuries_description}</p>` : ''}
        <p><strong>Dangerous Animal:</strong> ${report.is_dangerous ? 'Yes' : 'No'}</p>
        <p><strong>Additional Info:</strong> ${report.additional_info || 'None'}</p>
        <h3>Reporter Information</h3>
        <p><strong>Name:</strong> ${report.reporter_name}</p>
        <p><strong>Email:</strong> ${report.reporter_email}</p>
        <p><strong>Phone:</strong> ${report.reporter_phone || 'Not provided'}</p>
      `,
    });

    console.log('✅ Email sent:', data);
    return data;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
}