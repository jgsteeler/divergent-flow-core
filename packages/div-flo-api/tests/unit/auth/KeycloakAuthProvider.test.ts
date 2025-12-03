import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Auth0AuthProvider } from '../../../src/auth/Auth0AuthProvider';
import { AuthProvider } from '../../../src/auth/AuthProvider';

// Mock jose and fetch
vi.mock('jose', () => ({
  jwtVerify: vi.fn(),
  createRemoteJWKSet: vi.fn(() => 'mock-jwks'),
}));
global.fetch = vi.fn();

describe('Auth0AuthProvider', () => {
  let authProvider: Auth0AuthProvider;
  const mockIssuer = 'https://auth0.example.com/';
  const mockAudience = 'test-client';
  const mockJwksUrl = 'https://auth0.example.com/.well-known/jwks.json';

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AUTH0_ISSUER = mockIssuer;
    process.env.AUTH0_AUDIENCE = mockAudience;
    process.env.AUTH0_JWKS_URL = mockJwksUrl;
    process.env.AUTH0_ROLES_CLAIM = 'roles';
    authProvider = new Auth0AuthProvider();
  });

  describe('constructor', () => {
    it('should initialize with provided JWKS URL', () => {
      // Assert
      expect((authProvider as any).issuer).toBe(mockIssuer);
      expect((authProvider as any).audience).toBe(mockAudience);
      expect((authProvider as any).jwksUrl).toBe(mockJwksUrl);
      expect((authProvider as any).rolesClaim).toBe('roles');
    });
  });

  describe('validateAccessToken', () => {
    it('should validate token and return user info', async () => {
      // Arrange
      const mockToken = 'valid.jwt.token';
      const mockPayload = {
        sub: 'user-123',
        plan: 'premium',
        roles: ['user', 'admin'],
      };
      const mockProfile = {
        email: 'user@example.com',
        created_at: '2025-12-01T00:00:00.000Z',
        email_verified: true,
        family_name: 'Doe',
        given_name: 'John',
        name: 'John Doe',
        nickname: 'johnny',
        picture: 'http://example.com/pic.jpg',
      };
      const { jwtVerify } = await import('jose');
      (jwtVerify as any).mockResolvedValue({ payload: mockPayload });
      (global.fetch as any).mockResolvedValue({ ok: true, json: async () => mockProfile });

      // Act
      const result = await authProvider.validateAccessToken(mockToken);

      // Assert
      expect(jwtVerify).toHaveBeenCalledWith(mockToken, 'mock-jwks', {
        issuer: mockIssuer,
        audience: mockAudience,
      });
      expect(result).toEqual({
        sub: 'user-123',
        email: 'user@example.com',
        roles: ['user', 'admin'],
        plan: 'premium',
        created_at: new Date('2025-12-01T00:00:00.000Z'),
        email_verified: true,
        family_name: 'Doe',
        given_name: 'John',
        name: 'John Doe',
        nickname: 'johnny',
        picture: 'http://example.com/pic.jpg',
      });
    });

    it('should handle token with no roles', async () => {
      // Arrange
      const mockToken = 'valid.jwt.token';
      const mockPayload = { sub: 'user-123', plan: 'free' };
      const mockProfile = { email: 'user@example.com' };
      const { jwtVerify } = await import('jose');
      (jwtVerify as any).mockResolvedValue({ payload: mockPayload });
      (global.fetch as any).mockResolvedValue({ ok: true, json: async () => mockProfile });

      // Act
      const result = await authProvider.validateAccessToken(mockToken);

      // Assert
      expect(result.roles).toEqual([]);
    });

    it('should handle failed /userinfo fetch', async () => {
      // Arrange
      const mockToken = 'valid.jwt.token';
      const mockPayload = { sub: 'user-123', plan: 'free', roles: [] };
      const { jwtVerify } = await import('jose');
      (jwtVerify as any).mockResolvedValue({ payload: mockPayload });
      (global.fetch as any).mockResolvedValue({ ok: false, text: async () => 'error' });

      // Act
      const result = await authProvider.validateAccessToken(mockToken);

      // Assert
      expect(result.email).toBeUndefined();
    });

    it('should throw error for invalid token', async () => {
      // Arrange
      const mockToken = 'invalid.jwt.token';
      const mockError = new Error('Invalid signature');
      const { jwtVerify } = await import('jose');
      (jwtVerify as any).mockRejectedValue(mockError);

      // Act & Assert
      await expect(authProvider.validateAccessToken(mockToken)).rejects.toThrow('Token validation failed: Invalid signature');
    });
  });

  describe('getUserInfo', () => {
    it('should call validateAccessToken', async () => {
      // Arrange
      const mockToken = 'valid.jwt.token';
      const spy = vi.spyOn(authProvider, 'validateAccessToken').mockResolvedValue({ sub: 'user-123', email: 'user@example.com', roles: [], plan: 'free' });

      // Act
      const result = await authProvider.getUserInfo(mockToken);

      // Assert
      expect(spy).toHaveBeenCalledWith(mockToken);
      expect(result).toEqual({ sub: 'user-123', email: 'user@example.com', roles: [], plan: 'free' });
    });
  });

  describe('getJWKS', () => {
    it('should throw not implemented error', async () => {
      // Act & Assert
      await expect(authProvider.getJWKS()).rejects.toThrow('Not implemented');
    });
  });

  describe('createDeviceCode', () => {
    it('should throw not implemented error', async () => {
      // Act & Assert
      await expect(authProvider.createDeviceCode('client-id')).rejects.toThrow('Device code flow not implemented yet');
    });
  });
});