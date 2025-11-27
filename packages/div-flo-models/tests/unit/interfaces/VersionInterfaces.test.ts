import { describe, it, expect, vi } from 'vitest';
import { IVersionService, IVersionRepository, VersionInfo } from '../../../src/index';

describe('Version Interfaces (API v1 contract)', () => {
  describe('IVersionService interface', () => {
    it('should define getVersion method contract', () => {
      // Arrange - Create a mock implementation
      const mockService: IVersionService = {
        getVersion: vi.fn().mockResolvedValue({
          version: '1.0.0',
          service: 'test-service',
          timestamp: '2025-10-09T20:00:00.000Z',
        }),
      };

      // Act & Assert - Interface contract verification
      expect(mockService.getVersion).toBeDefined();
      expect(typeof mockService.getVersion).toBe('function');
    });

    it('should return Promise<VersionInfo> from getVersion', async () => {
      // Arrange
      const expectedVersionInfo: VersionInfo = {
        version: '2.1.0',
        service: 'api-service',
        timestamp: '2025-10-09T20:30:00.000Z',
      };

      const mockService: IVersionService = {
        getVersion: vi.fn().mockResolvedValue(expectedVersionInfo),
      };

      // Act
      const result = await mockService.getVersion();

      // Assert
      expect(result).toEqual(expectedVersionInfo);
      expect(mockService.getVersion).toHaveBeenCalledTimes(1);
    });

    it('should handle async errors in getVersion', async () => {
      // Arrange
      const expectedError = new Error('Service unavailable');
      const mockService: IVersionService = {
        getVersion: vi.fn().mockRejectedValue(expectedError),
      };

      // Act & Assert
      await expect(mockService.getVersion()).rejects.toThrow('Service unavailable');
    });
  });

  describe('IVersionRepository interface', () => {
    it('should define getVersionInfo method contract', () => {
      // Arrange - Create a mock implementation
      const mockRepository: IVersionRepository = {
        getVersionInfo: vi.fn().mockResolvedValue({
          version: '1.5.0',
          service: 'data-service',
          timestamp: '2025-10-09T21:00:00.000Z',
        }),
      };

      // Act & Assert - Interface contract verification
      expect(mockRepository.getVersionInfo).toBeDefined();
      expect(typeof mockRepository.getVersionInfo).toBe('function');
    });

    it('should return Promise<VersionInfo> from getVersionInfo', async () => {
      // Arrange
      const expectedVersionInfo: VersionInfo = {
        version: '3.0.0-beta',
        service: 'repository-service',
        timestamp: '2025-10-09T22:00:00.000Z',
      };

      const mockRepository: IVersionRepository = {
        getVersionInfo: vi.fn().mockResolvedValue(expectedVersionInfo),
      };

      // Act
      const result = await mockRepository.getVersionInfo();

      // Assert
      expect(result).toEqual(expectedVersionInfo);
      expect(mockRepository.getVersionInfo).toHaveBeenCalledTimes(1);
    });

    it('should handle async errors in getVersionInfo', async () => {
      // Arrange
      const expectedError = new Error('Database connection failed');
      const mockRepository: IVersionRepository = {
        getVersionInfo: vi.fn().mockRejectedValue(expectedError),
      };

      // Act & Assert
      await expect(mockRepository.getVersionInfo()).rejects.toThrow('Database connection failed');
    });
  });

  describe('interface compatibility', () => {
    it('should support different implementations of IVersionService', () => {
      // Arrange - Multiple implementations
      const implementations: IVersionService[] = [
        {
          getVersion: vi.fn().mockResolvedValue({
            version: '1.0.0',
            service: 'impl1',
            timestamp: '2025-10-09T20:00:00.000Z',
          }),
        },
        {
          getVersion: vi.fn().mockResolvedValue({
            version: '2.0.0',
            service: 'impl2',
            timestamp: '2025-10-09T20:00:00.000Z',
          }),
        },
      ];

      // Act & Assert
      implementations.forEach(impl => {
        expect(impl.getVersion).toBeDefined();
        expect(typeof impl.getVersion).toBe('function');
      });
    });

    it('should support different implementations of IVersionRepository', () => {
      // Arrange - Multiple implementations
      const implementations: IVersionRepository[] = [
        {
          getVersionInfo: vi.fn().mockResolvedValue({
            version: '1.0.0',
            service: 'repo-impl1',
            timestamp: '2025-10-09T20:00:00.000Z',
          }),
        },
        {
          getVersionInfo: vi.fn().mockResolvedValue({
            version: '2.0.0',
            service: 'repo-impl2',
            timestamp: '2025-10-09T20:00:00.000Z',
          }),
        },
      ];

      // Act & Assert
      implementations.forEach(impl => {
        expect(impl.getVersionInfo).toBeDefined();
        expect(typeof impl.getVersionInfo).toBe('function');
      });
    });

    it('should ensure interfaces use consistent VersionInfo type', () => {
      // Arrange
      const versionInfo: VersionInfo = {
        version: '1.0.0',
        service: 'consistency-test',
        timestamp: '2025-10-09T20:00:00.000Z',
      };

      const service: IVersionService = {
        getVersion: vi.fn().mockResolvedValue(versionInfo),
      };

      const repository: IVersionRepository = {
        getVersionInfo: vi.fn().mockResolvedValue(versionInfo),
      };

      // Act & Assert - Both interfaces should work with the same VersionInfo type
      expect(service.getVersion).toBeDefined();
      expect(repository.getVersionInfo).toBeDefined();
    });
  });
});