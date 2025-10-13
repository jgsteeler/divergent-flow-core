import { VersionService } from '../../../src/services/VersionService';
import { IVersionRepository } from '@div-flo/models';
import { VersionInfo } from '@div-flo/models';

// Create mock repository
const mockVersionRepository: jest.Mocked<IVersionRepository> = {
  getVersionInfo: jest.fn(),
};

describe('VersionService (repository contract)', () => {
  let versionService: VersionService;

  beforeEach(() => {
    versionService = new VersionService(mockVersionRepository);
    jest.clearAllMocks();
  });

  describe('getVersion', () => {
    it('should return version info from repository', async () => {
      const expectedVersionInfo: VersionInfo = {
        version: '1.2.3',
        service: 'divergent-flow-core',
        timestamp: '2025-10-09T20:00:00.000Z',
      };
      mockVersionRepository.getVersionInfo.mockResolvedValue(expectedVersionInfo);
      const result = await versionService.getVersion();
      expect(result).toBe(expectedVersionInfo);
      expect(mockVersionRepository.getVersionInfo).toHaveBeenCalledTimes(1);
      expect(mockVersionRepository.getVersionInfo).toHaveBeenCalledWith();
    });
    it('should propagate errors from repository', async () => {
      const expectedError = new Error('Repository error');
      mockVersionRepository.getVersionInfo.mockRejectedValue(expectedError);
      await expect(versionService.getVersion()).rejects.toThrow('Repository error');
      expect(mockVersionRepository.getVersionInfo).toHaveBeenCalledTimes(1);
    });
    it('should handle repository returning different version formats', async () => {
      const versionInfoWithPatch: VersionInfo = {
        version: '2.1.0-beta.1',
        service: 'divergent-flow-core',
        timestamp: '2025-10-09T20:00:00.000Z',
      };
      mockVersionRepository.getVersionInfo.mockResolvedValue(versionInfoWithPatch);
      const result = await versionService.getVersion();
      expect(result.version).toBe('2.1.0-beta.1');
      expect(result.service).toBe('divergent-flow-core');
      expect(result.timestamp).toBe('2025-10-09T20:00:00.000Z');
    });
    it('should maintain service contract without modification', async () => {
      const originalVersionInfo: VersionInfo = {
        version: '0.0.1',
        service: 'divergent-flow-core',
        timestamp: '2025-10-09T19:30:00.000Z',
      };
      mockVersionRepository.getVersionInfo.mockResolvedValue(originalVersionInfo);
      const result = await versionService.getVersion();
      expect(result).toEqual(originalVersionInfo);
      expect(result).toBe(originalVersionInfo);
    });
  });

  describe('dependency injection', () => {
    it('should be injectable and work with DI container', () => {
      const service = new VersionService(mockVersionRepository);
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(VersionService);
    });
  });
});