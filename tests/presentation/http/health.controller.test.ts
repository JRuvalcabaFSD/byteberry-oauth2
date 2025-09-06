import { HealthController } from '@presentation';
import { Container, TOKENS } from '@shared';
import { Request, Response } from 'express';

const mockLogger = {
  info: jest.fn(),
};
const mockConfig = {
  serviceName: 'byteberry-oauth2',
  nodeEnv: 'test',
  version: '1.0.0',
};

describe('HealthController', () => {
  let container: Container;
  let controller: HealthController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    container = new Container();
    container.registerInstance(TOKENS.Logger, mockLogger);
    container.registerInstance(TOKENS.Config, mockConfig);
    controller = new HealthController(container);
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  it('should return OK state when Gethealth is invoked', () => {
    controller.getHealth(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'ok' }));
  });
  it('Should include the name of the service in the response', () => {
    controller.getHealth(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({ service: mockConfig.serviceName }));
  });
  it('Should include the current time in the answer', () => {
    const fixedDate = new Date('2023-12-01T10:30:45.123Z');
    const mockDateConstructor = jest.spyOn(global, 'Date').mockImplementation(() => fixedDate);
    controller.getHealth(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        time: '2023-12-01T10:30:45.123Z',
      }),
    );
    expect(mockDateConstructor).toHaveBeenCalled();
    mockDateConstructor.mockRestore();
  });
  it('Should answer with two hundred code', () => {
    controller.getHealth(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
  });
});
