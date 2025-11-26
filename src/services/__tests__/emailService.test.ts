// src/services/__tests__/emailService.test.ts
import { jest, describe, beforeEach, afterEach, it, expect, beforeAll, afterAll } from '@jest/globals';
import type { Transporter } from 'nodemailer';
import { env } from '../../config/env';
import { Resend } from 'resend';

// Define test environment interface
interface TestEnv {
  NODE_ENV: 'development' | 'production' | 'test';
  EMAIL_FROM: string;
  EMAIL_PROVIDER: 'smtp' | 'sendgrid';
  SMTP_HOST?: string;
  SMTP_PORT?: number;
  SMTP_SECURE?: boolean;
  SMTP_USER?: string;
  SMTP_PASSWORD?: string;
  SENDGRID_API_KEY?: string;
}

// -----------------------------
// Mocks
// -----------------------------
// nodemailer mock
const mockSendMail = jest.fn((_options: any, cb?: (err: Error | null, info?: any) => void) => {
  const info = { messageId: 'test' };
  if (cb) cb(null, info);
  return Promise.resolve(info);
});

const mockCreateTransport = jest.fn((): Partial<Transporter> => ({
  sendMail: mockSendMail,
}));

jest.mock('nodemailer', () => ({
  __esModule: true,
  default: {
    createTransport: mockCreateTransport,
  },
  createTransport: mockCreateTransport,
}));

// resend mock (SendGrid API)
const mockSendEmail = jest.fn((_options: any) => Promise.resolve({ id: 'fake-id' }));

interface MockResendInstance {
  emails: {
    send: typeof mockSendEmail;
  };
  apiKey: string;
}

const mockResendInstance: MockResendInstance = {
  emails: {
    send: mockSendEmail,
  },
  apiKey: ''
};

const MockResend = jest.fn((apiKey?: string): MockResendInstance => {
  mockResendInstance.apiKey = apiKey || '';
  return mockResendInstance;
}) as unknown as jest.Mock & { new (apiKey?: string): MockResendInstance };

jest.mock('resend', () => ({
  __esModule: true,
  Resend: MockResend,
  default: MockResend,
}));

// Import the actual implementation after setting up mocks
import * as actualEmailService from '../emailservice';

// Mock the email service module
jest.mock('../emailService', () => {
  const actual = jest.requireActual('../emailService') as typeof actualEmailService;
  const mockFn = jest.fn((...args: Parameters<typeof actual.default>) => {
    return actual.default(...args);
  });
  
  return {
    ...actual,
    __esModule: true,
    default: mockFn
  } as typeof actualEmailService;
});

// Mock the env module
jest.mock('../../config/env', () => {
  const testEnv: TestEnv = {
    NODE_ENV: 'test',
    EMAIL_FROM: 'test@example.com',
    EMAIL_PROVIDER: 'smtp',
    SMTP_HOST: 'smtp.example.com',
    SMTP_PORT: 587,
    SMTP_SECURE: false,
    SMTP_USER: 'user',
    SMTP_PASSWORD: 'pass',
    SENDGRID_API_KEY: 'test-sendgrid-key',
  };
  
  return {
    __esModule: true,
    env: testEnv,
    default: { env: testEnv }
  };
});

// -----------------------------
// Tests
// -----------------------------
describe('Email Service', () => {
  let originalEnv: TestEnv;
  let originalNodeEnv: string | undefined;

  beforeAll(() => {
    originalNodeEnv = process.env.NODE_ENV;
  });

  afterAll(() => {
    if (originalNodeEnv !== undefined) {
      process.env.NODE_ENV = originalNodeEnv;
    } else {
      delete process.env.NODE_ENV;
    }
  });

  beforeEach(() => {
    originalEnv = { ...env } as TestEnv;
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    Object.assign(env, originalEnv);
    jest.restoreAllMocks();
  });

  const getEmailService = async (nodeEnv: 'development' | 'production' | 'test' = 'test') => {
    process.env.NODE_ENV = nodeEnv;
    jest.resetModules();
    const module = await import('../emailservice');
    return module.default;
  };

  it('should log email in development mode', async () => {
    const sendEmail = await getEmailService('development');
    env.NODE_ENV = 'development';

    await sendEmail({
      to: 'test@example.com',
      subject: 'Test Email',
      text: 'This is a test email',
    });

    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('EMAIL NOT SENT'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('To: test@example.com'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Subject: Test Email'));
  });

  it('should send email via SMTP in production', async () => {
    const sendEmail = await getEmailService('production');
    env.NODE_ENV = 'production';
    env.EMAIL_PROVIDER = 'smtp';

    await sendEmail({
      to: 'test@example.com',
      subject: 'Test Email',
      text: 'This is a test email',
    });

    expect(mockCreateTransport).toHaveBeenCalled();
    expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: env.EMAIL_FROM,
      to: 'test@example.com',
      subject: 'Test Email',
      text: 'This is a test email',
    }));
  });

  it('should send email via SendGrid in production', async () => {
    env.NODE_ENV = 'production';
    env.EMAIL_PROVIDER = 'sendgrid';
    env.SENDGRID_API_KEY = 'test-sendgrid-key';
    
    const sendEmail = await getEmailService('production');
    await sendEmail({
      to: 'test@example.com',
      subject: 'Test Email',
      text: 'This is a test email',
    });

    expect(MockResend).toHaveBeenCalledWith(env.SENDGRID_API_KEY);
    expect(mockResendInstance.apiKey).toBe(env.SENDGRID_API_KEY);
    expect(mockSendEmail).toHaveBeenCalledWith(expect.objectContaining({
      from: env.EMAIL_FROM,
      to: 'test@example.com',
      subject: 'Test Email',
      text: 'This is a test email',
    }));
  });
});