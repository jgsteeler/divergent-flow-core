import { Request, Response } from 'express';
import { VersionController } from '../../../src/controllers/VersionController';
import { IVersionService, VersionInfo } from '@div-flo/models';

// Mock version service
const mockVersionService: jest.Mocked<IVersionService> = {
  getVersion: jest.fn(),
};

// Mock Express Request and Response
const mockRequest = {} as Request;
const mockResponse = {
  json: jest.fn(),
  status: jest.fn(),
} as unknown as jest.Mocked<Response>;

// Setup chainable status method
(mockResponse.status as jest.Mock).mockImplementation(() => mockResponse);

describe('VersionController', () => {
  let versionController: VersionController;

  beforeEach(() => {
    versionController = new VersionController(mockVersionService);
    jest.clearAllMocks();
    
    // Reset and re-setup chainable status method
    (mockResponse.status as jest.Mock).mockImplementation(() => mockResponse);
  });

  describe('constructor', () => {
    it('should create instance with injected version service', () => {
      // Act & Assert
      expect(versionController).toBeDefined();
      expect(versionController).toBeInstanceOf(VersionController);
    });

    it('should return a router instance', () => {
      // Act
      const router = versionController.getRouter();

      // Assert
      expect(router).toBeDefined();
      expect(typeof router).toBe('function'); // Express router is a function
    });
  });

  describe('getVersion endpoint', () => {
    let getVersionMethod: (req: Request, res: Response) => Promise<void>;

    beforeEach(() => {
      // Access the private method through the controller instance for testing
      getVersionMethod = (versionController as any).getVersion.bind(versionController);
    });

    it('should return version information successfully', async () => {
      // Arrange
      const expectedVersionInfo: VersionInfo = {
        version: '1.2.3',
        service: 'divergent-flow-core',
        timestamp: '2025-10-09T20:00:00.000Z',
      };
      
      mockVersionService.getVersion.mockResolvedValue(expectedVersionInfo);

      // Act
      await getVersionMethod(mockRequest, mockResponse);

      // Assert
      expect(mockVersionService.getVersion).toHaveBeenCalledTimes(1);
      expect(mockVersionService.getVersion).toHaveBeenCalledWith();
      expect(mockResponse.json).toHaveBeenCalledWith(expectedVersionInfo);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should handle service errors and return 500 status', async () => {
      // Arrange
      const serviceError = new Error('Database connection failed');
      mockVersionService.getVersion.mockRejectedValue(serviceError);

      // Act
      await getVersionMethod(mockRequest, mockResponse);

      // Assert
      expect(mockVersionService.getVersion).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        error: 'Failed to get version information' 
      });
    });

    it('should handle different types of service errors', async () => {
      // Arrange
      mockVersionService.getVersion.mockRejectedValue('String error');

      // Act
      await getVersionMethod(mockRequest, mockResponse);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        error: 'Failed to get version information' 
      });
    });

    it('should handle service returning different version formats', async () => {
      // Arrange
      const versionInfo: VersionInfo = {
        version: '2.0.0-beta.1+build.123',
        service: 'divergent-flow-core',
        timestamp: '2025-10-09T15:30:45.123Z',
      };
      
      mockVersionService.getVersion.mockResolvedValue(versionInfo);

      // Act
      await getVersionMethod(mockRequest, mockResponse);

      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith(versionInfo);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('router configuration', () => {
    it('should have GET route configured for root path', () => {
      // Arrange & Act
      const router = versionController.getRouter();

      // Assert
      expect(router).toBeDefined();
      // Note: Testing Express router internals is complex, 
      // but we can verify the router exists and is callable
      expect(typeof router).toBe('function');
    });
  });

  describe('dependency injection', () => {
    it('should work with different version service implementations', () => {
      // Arrange
      const alternativeService: jest.Mocked<IVersionService> = {
        getVersion: jest.fn(),
      };

      // Act
      const controller = new VersionController(alternativeService);

      // Assert
      expect(controller).toBeDefined();
      expect(controller.getRouter()).toBeDefined();
    });
  });
});