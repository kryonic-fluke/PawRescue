import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    const body = await request.json();
    const { phoneNumber, message, notificationType } = body;

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    // Twilio configuration from environment variables
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      // If Twilio credentials are not configured, log the notification attempt
      console.log('SMS Notification (Demo Mode):', {
        to: phoneNumber,
        message,
        type: notificationType,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({
        success: true,
        message: 'SMS notification queued (demo mode)',
        demo: true,
        details: {
          to: phoneNumber,
          messagePreview: message.substring(0, 50) + '...',
          timestamp: new Date().toISOString()
        }
      });
    }

    // Real Twilio SMS sending
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    const credentials = Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64');

    const formData = new URLSearchParams();
    formData.append('To', phoneNumber);
    formData.append('From', twilioPhoneNumber);
    formData.append('Body', message);

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!twilioResponse.ok) {
      const error = await twilioResponse.json();
      throw new Error(error.message || 'Failed to send SMS via Twilio');
    }

    const result = await twilioResponse.json();

    return NextResponse.json({
      success: true,
      message: 'SMS sent successfully',
      sid: result.sid,
      timestamp: result.date_created
    });
  } catch (error: any) {
    console.error('SMS notification error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send SMS notification',
        details: error.message,
        demo: true
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return SMS notification status/history
    return NextResponse.json({
      twilioConfigured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
      status: 'operational',
      demoMode: !process.env.TWILIO_ACCOUNT_SID
    });
  } catch (error) {
    console.error('Error checking SMS status:', error);
    return NextResponse.json(
      { error: 'Failed to check SMS status' },
      { status: 500 }
    );
  }
}
