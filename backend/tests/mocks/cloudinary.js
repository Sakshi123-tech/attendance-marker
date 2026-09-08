const uploadMock = jest.fn().mockResolvedValue({
  secure_url: 'https://res.cloudinary.com/test/image/upload/test.jpg',
  public_id: 'test/test-image',
});

const destroyMock = jest.fn().mockResolvedValue({ result: 'ok' });

module.exports = {
  v2: {
    config: jest.fn(),
    uploader: {
      upload: uploadMock,
      destroy: destroyMock,
    },
  },
};
