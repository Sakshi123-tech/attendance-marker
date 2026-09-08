const sendMailMock = jest.fn().mockResolvedValue({ messageId: 'test-message-id' });

const createTransportMock = jest.fn().mockReturnValue({
  sendMail: sendMailMock,
});

module.exports = {
  createTransport: createTransportMock,
  __sendMailMock: sendMailMock,
};
