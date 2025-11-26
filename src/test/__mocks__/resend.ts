// src/test/__mocks__/resend.ts
export const mockSend = jest.fn().mockResolvedValue({ data: { id: 'mocked-id' }, error: null });

const MockResend = jest.fn().mockImplementation(() => ({
  emails: {
    send: mockSend
  }
}));

export const Resend = MockResend;
export default MockResend;