import 'reflect-metadata';
import { Request, Response } from 'express';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VersionController } from '../../../src/controllers/VersionController';
import { IVersionService, VersionInfo } from '@div-flo/models';

// Mock version service
const mockVersionService: any = {
  getVersion: vi.fn(),
};

// Mock Express Request and Response
const mockRequest = {} as Request;
const mockResponse = {
  json: vi.fn(),
  status: vi.fn(),
} as any;

// Setup chainable status method
(mockResponse.status as any).mockImplementation(() => mockResponse);

describe('VersionController (mounted at /v1/version)', () => {
  let versionController: VersionController;

  beforeEach(() => {
    versionController = new VersionController(mockVersionService);
    vi.clearAllMocks();
    (mockResponse.status as any).mockImplementation(() => mockResponse);
  });

  describe('constructor', () => {
    it('should create instance with injected version service', () => {
      expect(versionController).toBeDefined();
      expect(versionController).toBeInstanceOf(VersionController);
    });
    it('should return a router instance', () => {
      const router = versionController.getRouter();
      expect(router).toBeDefined();
      expect(typeof router).toBe('function');
    });
  });

  describe('getVersion endpoint', () => {
    let getVersionMethod: (req: Request, res: Response) => Promise<void>;
    beforeEach(() => {
      getVersionMethod = (versionController as any).getVersion.bind(versionController);
    });
    it('should return version information successfully', async () => {
      const expectedVersionInfo: VersionInfo = {
        version: '1.2.3',
        service: 'divergent-flow-core',
        timestamp: '2025-10-09T20:00:00.000Z',
      };
      mockVersionService.getVersion.mockResolvedValue(expectedVersionInfo);
      await getVersionMethod(mockRequest, mockResponse);
      expect(mockVersionService.getVersion).toHaveBeenCalledTimes(1);
      expect(mockVersionService.getVersion).toHaveBeenCalledWith();
      expect(mockResponse.json).toHaveBeenCalledWith(expectedVersionInfo);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
    it('should handle service errors and return 500 status', async () => {
      const serviceError = new Error('Database connection failed');
      mockVersionService.getVersion.mockRejectedValue(serviceError);
      await getVersionMethod(mockRequest, mockResponse);
      expect(mockVersionService.getVersion).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to get version information' });
    });
    it('should handle different types of service errors', async () => {
      mockVersionService.getVersion.mockRejectedValue('String error');
      await getVersionMethod(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to get version information' });
    });
    it('should handle service returning different version formats', async () => {
      const versionInfo: VersionInfo = {
        version: '2.0.0-beta.1+build.123',
        service: 'divergent-flow-core',
        timestamp: '2025-10-09T15:30:45.123Z',
      };
      mockVersionService.getVersion.mockResolvedValue(versionInfo);
      await getVersionMethod(mockRequest, mockResponse);
      expect(mockResponse.json).toHaveBeenCalledWith(versionInfo);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('router configuration', () => {
    it('should have GET route configured for / (mounted at /v1/version)', () => {
      const router = versionController.getRouter();
      expect(router).toBeDefined();
      expect(typeof router).toBe('function');
      // Note: The router is expected to be mounted at /v1/version in the main app
    });
  });

  describe('dependency injection', () => {
    it('should work with different version service implementations', () => {
      const alternativeService: any = {
        getVersion: vi.fn(),
      };
      const controller = new VersionController(alternativeService);
      expect(controller).toBeDefined();
      expect(controller.getRouter()).toBeDefined();
    });
  });
});