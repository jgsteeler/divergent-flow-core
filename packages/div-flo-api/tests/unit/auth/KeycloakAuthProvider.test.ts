import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KeycloakAuthProvider } from '../../../src/auth/KeycloakAuthProvider';
import { AuthProvider } from '../../../src/auth/AuthProvider';

// Mock jose library
vi.mock('jose', () => ({
  jwtVerify: vi.fn(),
  createRemoteJWKSet: vi.fn(() => 'mock-jwks'),
}));

describe('KeycloakAuthProvider', () => {
  let authProvider: KeycloakAuthProvider;
  const mockIssuer = 'https://keycloak.example.com/realms/test';
  const mockAudience = 'test-client';
  const mockJwksUrl = 'https://keycloak.example.com/realms/test/protocol/openid-connect/certs';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with provided JWKS URL', () => {
      // Act
      authProvider = new KeycloakAuthProvider(mockIssuer, mockAudience, mockJwksUrl);

      // Assert
      expect((authProvider as any).issuer).toBe(mockIssuer);
      expect((authProvider as any).audiences).toEqual([mockAudience]);
      expect((authProvider as any).jwksUrl).toBe(mockJwksUrl);
    });

    it('should derive JWKS URL from issuer when not provided', () => {
      // Act
      authProvider = new KeycloakAuthProvider(mockIssuer, mockAudience);

      // Assert
      expect((authProvider as any).jwksUrl).toBe(`${mockIssuer}/protocol/openid-connect/certs`);
    });

    it('should handle multiple audiences', () => {
      // Arrange
      const multipleAudiences = 'client1, client2 , client3';

      // Act
      authProvider = new KeycloakAuthProvider(mockIssuer, multipleAudiences);

      // Assert
      expect((authProvider as any).audiences).toEqual(['client1', 'client2', 'client3']);
    });

    it('should handle empty audience', () => {
      // Act
      authProvider = new KeycloakAuthProvider(mockIssuer, '');

      // Assert
      expect((authProvider as any).audiences).toEqual([]);
    });
  });

  describe('validateAccessToken', () => {
    beforeEach(() => {
      authProvider = new KeycloakAuthProvider(mockIssuer, mockAudience);
    });

    it('should validate token successfully and return user info', async () => {
      // Arrange
      const mockToken = 'valid.jwt.token';
      const mockPayload = {
        sub: 'user-123',
        email: 'user@example.com',
        realm_access: { roles: ['user', 'admin'] },
        plan: 'premium',
      };

      const { jwtVerify } = await import('jose');
      (jwtVerify as any).mockResolvedValue({
        payload: mockPayload,
      });

      // Act
      const result = await authProvider.validateAccessToken(mockToken);

      // Assert
      expect(jwtVerify).toHaveBeenCalledWith(mockToken, 'mock-jwks', {
        issuer: mockIssuer,
        audience: [mockAudience],
      });
      expect(result).toEqual({
        sub: 'user-123',
        email: 'user@example.com',
        roles: ['user', 'admin'],
        plan: 'premium',
      });
    });

    it('should handle token without realm_access', async () => {
      // Arrange
      const mockToken = 'valid.jwt.token';
      const mockPayload = {
        sub: 'user-123',
        email: 'user@example.com',
        plan: 'free',
      };

      const { jwtVerify } = await import('jose');
      (jwtVerify as any).mockResolvedValue({
        payload: mockPayload,
      });

      // Act
      const result = await authProvider.validateAccessToken(mockToken);

      // Assert
      expect(result).toEqual({
        sub: 'user-123',
        email: 'user@example.com',
        roles: [],
        plan: 'free',
      });
    });

    it('should handle token without plan', async () => {
      // Arrange
      const mockToken = 'valid.jwt.token';
      const mockPayload = {
        sub: 'user-123',
        email: 'user@example.com',
        realm_access: { roles: ['user'] },
      };

      const { jwtVerify } = await import('jose');
      (jwtVerify as any).mockResolvedValue({
        payload: mockPayload,
      });

      // Act
      const result = await authProvider.validateAccessToken(mockToken);

      // Assert
      expect(result).toEqual({
        sub: 'user-123',
        email: 'user@example.com',
        roles: ['user'],
        plan: 'free',
      });
    });

    it('should throw error for invalid token', async () => {
      // Arrange
      const mockToken = 'invalid.jwt.token';
      const mockError = new Error('Invalid signature');

      const { jwtVerify } = await import('jose');
      (jwtVerify as any).mockRejectedValue(mockError);

      // Act & Assert
      await expect(authProvider.validateAccessToken(mockToken))
        .rejects
        .toThrow('Token validation failed: Invalid signature');
    });

    it('should validate token without audience when none specified', async () => {
      // Arrange
      authProvider = new KeycloakAuthProvider(mockIssuer, '');
      const mockToken = 'valid.jwt.token';
      const mockPayload = {
        sub: 'user-123',
        email: 'user@example.com',
      };

      const { jwtVerify } = await import('jose');
      (jwtVerify as any).mockResolvedValue({
        payload: mockPayload,
      });

      // Act
      const result = await authProvider.validateAccessToken(mockToken);

      // Assert
      expect(jwtVerify).toHaveBeenCalledWith(mockToken, 'mock-jwks', {
        issuer: mockIssuer,
        audience: undefined,
      });
    });
  });

  describe('getUserInfo', () => {
    beforeEach(() => {
      authProvider = new KeycloakAuthProvider(mockIssuer, mockAudience);
    });

    it('should return same info as validateAccessToken', async () => {
      // Arrange
      const mockToken = 'valid.jwt.token';
      const mockPayload = {
        sub: 'user-123',
        email: 'user@example.com',
        realm_access: { roles: ['user'] },
        plan: 'premium',
      };

      const { jwtVerify } = await import('jose');
      (jwtVerify as any).mockResolvedValue({
        payload: mockPayload,
      });

      // Act
      const result = await authProvider.getUserInfo(mockToken);

      // Assert
      expect(result).toEqual({
        sub: 'user-123',
        email: 'user@example.com',
        roles: ['user'],
        plan: 'premium',
      });
    });
  });

  describe('getJWKS', () => {
    beforeEach(() => {
      authProvider = new KeycloakAuthProvider(mockIssuer, mockAudience);
    });

    it('should throw not implemented error', async () => {
      // Act & Assert
      await expect(authProvider.getJWKS())
        .rejects
        .toThrow('Not implemented');
    });
  });

  describe('createDeviceCode', () => {
    beforeEach(() => {
      authProvider = new KeycloakAuthProvider(mockIssuer, mockAudience);
    });

    it('should throw not implemented error', async () => {
      // Act & Assert
      await expect(authProvider.createDeviceCode('client-id'))
        .rejects
        .toThrow('Device code flow not implemented yet');
    });
  });

  describe('getJWKSet caching', () => {
    it('should cache JWKS instance', () => {
      // Arrange
      authProvider = new KeycloakAuthProvider(mockIssuer, mockAudience);

      // Act
      const jwks1 = (authProvider as any).getJWKSet();
      const jwks2 = (authProvider as any).getJWKSet();

      // Assert
      expect(jwks1).toBe(jwks2);
      expect(jwks1).toBe('mock-jwks');
    });
  });
});