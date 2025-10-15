import 'reflect-metadata';
import { VersionRepository } from '../../../src/repositories/VersionRepository';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs module
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

// Mock path module
jest.mock('path');
const mockedPath = path as jest.Mocked<typeof path>;

describe('VersionRepository', () => {
  let versionRepository: VersionRepository;

  beforeEach(() => {
    versionRepository = new VersionRepository();
    jest.clearAllMocks();
  });

  describe('getVersionInfo', () => {
    it('should return version info with correct version from package.json', async () => {
      // Arrange
      const mockPackageJson = {
        version: '1.2.3',
        name: '@div-flo/core',
      };
      const mockPath = '/mock/path/to/package.json';
      
      mockedPath.join.mockReturnValue(mockPath);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      // Act
      const result = await versionRepository.getVersionInfo();

      // Assert
      expect(result.version).toBe('1.2.3');
      expect(result.service).toBe('divergent-flow-core');
      expect(result.timestamp).toBeDefined();
      expect(typeof result.timestamp).toBe('string');
      
      // Verify the timestamp is a valid ISO string
      expect(() => new Date(result.timestamp)).not.toThrow();
    });

    it('should return fallback version when package.json cannot be read', async () => {
      // Arrange
      const mockPath = '/mock/path/to/package.json';
      
      mockedPath.join.mockReturnValue(mockPath);
      mockedFs.readFileSync.mockImplementation(() => {
        throw new Error('ENOENT: no such file or directory');
      });

      // Spy on console.warn to verify error logging
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Act
      const result = await versionRepository.getVersionInfo();

      // Assert
      expect(result.version).toBe('0.0.0');
      expect(result.service).toBe('divergent-flow-core');
      expect(result.timestamp).toBeDefined();
      
      // Verify error was logged
      expect(consoleSpy).toHaveBeenCalledWith(
        'Could not read package version:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should return fallback version when package.json contains invalid JSON', async () => {
      // Arrange
      const mockPath = '/mock/path/to/package.json';
      
      mockedPath.join.mockReturnValue(mockPath);
      mockedFs.readFileSync.mockReturnValue('invalid json content');

      // Spy on console.warn to verify error logging
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Act
      const result = await versionRepository.getVersionInfo();

      // Assert
      expect(result.version).toBe('0.0.0');
      expect(result.service).toBe('divergent-flow-core');
      
      // Verify error was logged
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should construct correct path to package.json', async () => {
      // Arrange
      const mockPackageJson = { version: '2.0.0' };
      mockedPath.join.mockReturnValue('/constructed/path');
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      // Act
      await versionRepository.getVersionInfo();

      // Assert
      expect(mockedPath.join).toHaveBeenCalledWith(
        expect.stringContaining('repositories'),
        '../../package.json'
      );
    });

    it('should include current timestamp in ISO format', async () => {
      // Arrange
      const mockPackageJson = { version: '1.0.0' };
      mockedPath.join.mockReturnValue('/mock/path');
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const beforeTime = new Date();

      // Act
      const result = await versionRepository.getVersionInfo();

      // Assert
      const afterTime = new Date();
      const resultTime = new Date(result.timestamp);
      
      expect(resultTime >= beforeTime).toBe(true);
      expect(resultTime <= afterTime).toBe(true);
      
      // Verify it's a valid ISO string format
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });
});