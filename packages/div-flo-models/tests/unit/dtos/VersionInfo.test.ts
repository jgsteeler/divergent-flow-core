import { VersionInfo } from '../../../src/dtos/VersionInfo';

describe('VersionInfo DTO', () => {
  describe('interface contract', () => {
    it('should accept valid VersionInfo objects', () => {
      // Arrange
      const validVersionInfo: VersionInfo = {
        version: '1.0.0',
        service: 'test-service',
        timestamp: '2025-10-09T20:00:00.000Z',
      };

      // Act & Assert - TypeScript compilation validates the interface
      expect(validVersionInfo.version).toBe('1.0.0');
      expect(validVersionInfo.service).toBe('test-service');
      expect(validVersionInfo.timestamp).toBe('2025-10-09T20:00:00.000Z');
    });

    it('should support semantic versioning formats', () => {
      // Arrange & Act
      const versions: VersionInfo[] = [
        {
          version: '1.0.0',
          service: 'service1',
          timestamp: '2025-10-09T20:00:00.000Z',
        },
        {
          version: '2.1.3',
          service: 'service2',
          timestamp: '2025-10-09T20:00:00.000Z',
        },
        {
          version: '1.0.0-alpha',
          service: 'service3',
          timestamp: '2025-10-09T20:00:00.000Z',
        },
        {
          version: '2.1.0-beta.1',
          service: 'service4',
          timestamp: '2025-10-09T20:00:00.000Z',
        },
        {
          version: '1.0.0-alpha.1+build.123',
          service: 'service5',
          timestamp: '2025-10-09T20:00:00.000Z',
        },
      ];

      // Assert
      versions.forEach(versionInfo => {
        expect(typeof versionInfo.version).toBe('string');
        expect(versionInfo.version.length).toBeGreaterThan(0);
        expect(typeof versionInfo.service).toBe('string');
        expect(typeof versionInfo.timestamp).toBe('string');
      });
    });

    it('should support different service names', () => {
      // Arrange
      const serviceNames = [
        'divergent-flow-core',
        'api-service',
        'user-management',
        'notification-service',
      ];

      // Act & Assert
      serviceNames.forEach(serviceName => {
        const versionInfo: VersionInfo = {
          version: '1.0.0',
          service: serviceName,
          timestamp: '2025-10-09T20:00:00.000Z',
        };

        expect(versionInfo.service).toBe(serviceName);
      });
    });

    it('should support ISO 8601 timestamp formats', () => {
      // Arrange
      const timestamps = [
        '2025-10-09T20:00:00.000Z',
        '2025-12-25T15:30:45.123Z',
        '2025-01-01T00:00:00.000Z',
      ];

      // Act & Assert
      timestamps.forEach(timestamp => {
        const versionInfo: VersionInfo = {
          version: '1.0.0',
          service: 'test-service',
          timestamp,
        };

        expect(versionInfo.timestamp).toBe(timestamp);
        // Verify it's a valid date
        expect(new Date(timestamp).toISOString()).toBe(timestamp);
      });
    });
  });

  describe('data validation scenarios', () => {
    it('should handle empty strings (though not recommended)', () => {
      // Arrange & Act
      const versionInfo: VersionInfo = {
        version: '',
        service: '',
        timestamp: '',
      };

      // Assert - Interface allows empty strings, but they're not useful
      expect(typeof versionInfo.version).toBe('string');
      expect(typeof versionInfo.service).toBe('string');
      expect(typeof versionInfo.timestamp).toBe('string');
    });

    it('should be serializable to JSON', () => {
      // Arrange
      const versionInfo: VersionInfo = {
        version: '1.2.3',
        service: 'test-service',
        timestamp: '2025-10-09T20:00:00.000Z',
      };

      // Act
      const json = JSON.stringify(versionInfo);
      const parsed = JSON.parse(json) as VersionInfo;

      // Assert
      expect(parsed.version).toBe(versionInfo.version);
      expect(parsed.service).toBe(versionInfo.service);
      expect(parsed.timestamp).toBe(versionInfo.timestamp);
    });

    it('should support object destructuring', () => {
      // Arrange
      const versionInfo: VersionInfo = {
        version: '2.0.0',
        service: 'api-service',
        timestamp: '2025-10-09T20:00:00.000Z',
      };

      // Act
      const { version, service, timestamp } = versionInfo;

      // Assert
      expect(version).toBe('2.0.0');
      expect(service).toBe('api-service');
      expect(timestamp).toBe('2025-10-09T20:00:00.000Z');
    });
  });
});