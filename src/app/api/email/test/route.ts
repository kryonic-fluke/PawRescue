// src/app/api/email/test/route.ts
import { NextResponse } from 'next/server';
import { testEmailService } from '@/services/emailservice';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('API route called');
    const result = await testEmailService();
    console.log('Email service result:', result);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test email sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Test email failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send test email',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}