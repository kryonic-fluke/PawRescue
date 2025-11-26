// src/test/__mocks__/nodemailer.ts
export const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'mocked-message-id' });
export const mockCreateTransport = jest.fn().mockReturnValue({
  sendMail: mockSendMail,
  verify: jest.fn().mockResolvedValue(true)
});

const nodemailer = {
  createTransport: mockCreateTransport
};

export default nodemailer;