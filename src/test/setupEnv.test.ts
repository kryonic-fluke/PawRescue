// src/test/setupEnv.test.ts
import { testEnv } from './setupEnv';

describe('Environment Setup', () => {
  it('should have test environment variables properly configured', () => {
    // Test the test environment
    expect(testEnv.NODE_ENV).toBe('test');
    
    // Test other required environment variables
    expect(testEnv.DATABASE_URL).toBeDefined();
    expect(testEnv.DATABASE_URL).not.toBe('');
    
    // Add more assertions for other required environment variables
  });

  it('should have NODE_ENV set to test in process.env', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
});