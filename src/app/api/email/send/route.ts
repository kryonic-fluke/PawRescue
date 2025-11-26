// src/app/api/email/send/route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

// Initialize Resend with environment variable
const resendApiKey = process.env.RESEND_API_KEY;
const isResendEnabled = process.env.NEXT_PUBLIC_RESEND_ENABLED === 'true';

if (!resendApiKey && process.env.NODE_ENV === 'production') {
  console.warn('RESEND_API_KEY is not set. Emails will not be sent in production.');
}

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { to, subject, text, from = process.env.EMAIL_FROM || 'noreply@yourdomain.com', attachments = [] } = req.body;

    // Debug information
    const debugInfo = {
      resendEnabled: isResendEnabled,
      hasApiKey: !!resendApiKey,
      nodeEnv: process.env.NODE_ENV,
      from,
      to,
      subject,
      hasText: !!text,
      attachmentsCount: attachments?.length || 0
    };

    console.log('Email request received:', debugInfo);

    // Basic validation
    if (!to || !subject || !text) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        details: 'to, subject, and text are required',
        debug: debugInfo
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address',
        details: 'The "to" field contains an invalid email address',
        debug: debugInfo
      });
    }

    // In development or if Resend is not configured, log the email instead of sending
    if (process.env.NODE_ENV !== 'production' || !isResendEnabled || !resend) {
      console.log('Email would be sent (not in production or Resend not configured):', debugInfo);
      
      return res.status(200).json({ 
        success: true, 
        message: 'Email would be sent in production with Resend configured',
        demo: true,
        email: { from, to, subject, text },
        debug: debugInfo
      });
    }

    // Process attachments
    let processedAttachments = [];
    try {
      if (attachments && attachments.length > 0) {
        processedAttachments = await Promise.all(
          attachments.map(async (file: any) => {
            try {
              return {
                filename: file.filename || 'attachment',
                content: file.content,
                contentType: file.contentType
              };
            } catch (error) {
              console.error('Error processing attachment:', error);
              throw new Error(`Failed to process attachment: ${file.filename || 'unnamed'}`);
            }
          })
        );
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Failed to process attachments',
        details: error instanceof Error ? error.message : 'Unknown error processing attachments',
        debug: debugInfo
      });
    }

    // Send email using Resend
    try {
      const { data, error } = await resend.emails.send({
        from: from as string,
        to: [to as string],
        subject: subject as string,
        text: text as string,
        attachments: processedAttachments
      });

      if (error) {
        console.error('Resend API error:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to send email',
          details: error.message,
          debug: {
            ...debugInfo,
            resendError: error
          }
        });
      }

      console.log('Email sent successfully:', { messageId: data?.id });
      return res.status(200).json({ 
        success: true, 
        message: 'Email sent successfully',
        data: {
          messageId: data?.id,
          ...(process.env.NODE_ENV !== 'production' && { debug: debugInfo })
        }
      });

    } catch (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error during send',
        debug: {
          ...debugInfo,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }

  } catch (error) {
    console.error('Unexpected error in email handler:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process email request',
      details: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        resendEnabled: isResendEnabled,
        hasApiKey: !!resendApiKey,
        nodeEnv: process.env.NODE_ENV,
        error: error instanceof Error ? error.stack : 'No stack trace available'
      }
    });
  }
}