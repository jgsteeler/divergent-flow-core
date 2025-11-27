import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CaptureRepository } from '../../../src/repositories/CaptureRepository';
import { ICaptureRepository } from '@div-flo/models';
import { PrismaClient } from '@prisma/client';

describe('CaptureRepository', () => {
  let captureRepository: CaptureRepository;
  let mockPrisma: any;

  beforeEach(() => {
    // Mock PrismaClient
    mockPrisma = {
      capture: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    // Create repository with mocked Prisma
    captureRepository = new CaptureRepository(mockPrisma);
    // Inject the mock Prisma client
    (captureRepository as any).prisma = mockPrisma;

    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a capture successfully', async () => {
      // Arrange
      const captureData = {
        id: 'capture-123',
        userId: 'user-123',
        rawText: 'Test capture text',
        createdAt: new Date('2025-10-16T00:00:00Z'),
        updatedAt: new Date('2025-10-16T00:00:00Z'),
        migratedDate: null,
      };

      mockPrisma.capture.create.mockResolvedValue(captureData);

      // Act
      const result = await captureRepository.create(captureData);

      // Assert
      expect(mockPrisma.capture.create).toHaveBeenCalledWith({
        data: {
          id: captureData.id,
          userId: captureData.userId,
          rawText: captureData.rawText,
          createdAt: captureData.createdAt,
          updatedAt: captureData.updatedAt,
          migratedDate: undefined, // null becomes undefined
        },
      });
      expect(result).toEqual(captureData);
    });

    it('should create a capture with migrated date', async () => {
      // Arrange
      const migratedDate = new Date('2025-10-17T00:00:00Z');
      const captureData = {
        id: 'capture-123',
        userId: 'user-123',
        rawText: 'Test capture text',
        createdAt: new Date('2025-10-16T00:00:00Z'),
        updatedAt: new Date('2025-10-16T00:00:00Z'),
        migratedDate,
      };

      mockPrisma.capture.create.mockResolvedValue(captureData);

      // Act
      const result = await captureRepository.create(captureData);

      // Assert
      expect(mockPrisma.capture.create).toHaveBeenCalledWith({
        data: {
          id: captureData.id,
          userId: captureData.userId,
          rawText: captureData.rawText,
          createdAt: captureData.createdAt,
          updatedAt: captureData.updatedAt,
          migratedDate,
        },
      });
      expect(result).toEqual(captureData);
    });
  });

  describe('findById', () => {
    it('should find capture by id', async () => {
      // Arrange
      const captureId = 'capture-123';
      const expectedCapture = {
        id: captureId,
        userId: 'user-123',
        rawText: 'Test capture',
        createdAt: new Date('2025-10-16T00:00:00Z'),
        updatedAt: new Date('2025-10-16T00:00:00Z'),
        migratedDate: null,
      };

      mockPrisma.capture.findUnique.mockResolvedValue(expectedCapture);

      // Act
      const result = await captureRepository.findById(captureId);

      // Assert
      expect(mockPrisma.capture.findUnique).toHaveBeenCalledWith({
        where: { id: captureId },
      });
      expect(result).toEqual(expectedCapture);
    });

    it('should return null when capture not found', async () => {
      // Arrange
      mockPrisma.capture.findUnique.mockResolvedValue(null);

      // Act
      const result = await captureRepository.findById('nonexistent');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update capture successfully', async () => {
      // Arrange
      const captureData = {
        id: 'capture-123',
        userId: 'user-123',
        rawText: 'Updated capture text',
        createdAt: new Date('2025-10-16T00:00:00Z'),
        updatedAt: new Date('2025-10-17T00:00:00Z'),
        migratedDate: new Date('2025-10-17T00:00:00Z'),
      };

      mockPrisma.capture.update.mockResolvedValue(captureData);

      // Act
      const result = await captureRepository.update(captureData);

      // Assert
      expect(mockPrisma.capture.update).toHaveBeenCalledWith({
        where: { id: captureData.id },
        data: {
          userId: captureData.userId,
          rawText: captureData.rawText,
          migratedDate: captureData.migratedDate,
        },
      });
      expect(result).toEqual(captureData);
    });

    it('should update capture with null migrated date', async () => {
      // Arrange
      const captureData = {
        id: 'capture-123',
        userId: 'user-123',
        rawText: 'Updated capture text',
        createdAt: new Date('2025-10-16T00:00:00Z'),
        updatedAt: new Date('2025-10-17T00:00:00Z'),
        migratedDate: null,
      };

      mockPrisma.capture.update.mockResolvedValue(captureData);

      // Act
      const result = await captureRepository.update(captureData);

      // Assert
      expect(mockPrisma.capture.update).toHaveBeenCalledWith({
        where: { id: captureData.id },
        data: {
          userId: captureData.userId,
          rawText: captureData.rawText,
          migratedDate: undefined, // null becomes undefined
        },
      });
      expect(result).toEqual(captureData);
    });
  });

  describe('delete', () => {
    it('should delete capture successfully', async () => {
      // Arrange
      const captureId = 'capture-123';
      mockPrisma.capture.delete.mockResolvedValue(undefined);

      // Act
      await captureRepository.delete(captureId);

      // Assert
      expect(mockPrisma.capture.delete).toHaveBeenCalledWith({
        where: { id: captureId },
      });
    });
  });

  describe('listByUser', () => {
    it('should list all captures for a user', async () => {
      // Arrange
      const userId = 'user-123';
      const expectedCaptures = [
        {
          id: 'capture-1',
          userId,
          rawText: 'First capture',
          createdAt: new Date('2025-10-16T00:00:00Z'),
          updatedAt: new Date('2025-10-16T00:00:00Z'),
          migratedDate: null,
        },
        {
          id: 'capture-2',
          userId,
          rawText: 'Second capture',
          createdAt: new Date('2025-10-17T00:00:00Z'),
          updatedAt: new Date('2025-10-17T00:00:00Z'),
          migratedDate: new Date('2025-10-17T00:00:00Z'),
        },
      ];

      mockPrisma.capture.findMany.mockResolvedValue(expectedCaptures);

      // Act
      const result = await captureRepository.listByUser(userId);

      // Assert
      expect(mockPrisma.capture.findMany).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(result).toEqual(expectedCaptures);
    });

    it('should list only unmigrated captures when onlyUnmigrated is true', async () => {
      // Arrange
      const userId = 'user-123';
      const expectedCaptures = [
        {
          id: 'capture-1',
          userId,
          rawText: 'Unmigrated capture',
          createdAt: new Date('2025-10-16T00:00:00Z'),
          updatedAt: new Date('2025-10-16T00:00:00Z'),
          migratedDate: null,
        },
      ];

      mockPrisma.capture.findMany.mockResolvedValue(expectedCaptures);

      // Act
      const result = await captureRepository.listByUser(userId, true);

      // Assert
      expect(mockPrisma.capture.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          migratedDate: null,
        },
      });
      expect(result).toEqual(expectedCaptures);
    });

    it('should list all captures when onlyUnmigrated is false', async () => {
      // Arrange
      const userId = 'user-123';
      const expectedCaptures = [
        {
          id: 'capture-1',
          userId,
          rawText: 'Unmigrated capture',
          createdAt: new Date('2025-10-16T00:00:00Z'),
          updatedAt: new Date('2025-10-16T00:00:00Z'),
          migratedDate: null,
        },
        {
          id: 'capture-2',
          userId,
          rawText: 'Migrated capture',
          createdAt: new Date('2025-10-17T00:00:00Z'),
          updatedAt: new Date('2025-10-17T00:00:00Z'),
          migratedDate: new Date('2025-10-17T00:00:00Z'),
        },
      ];

      mockPrisma.capture.findMany.mockResolvedValue(expectedCaptures);

      // Act
      const result = await captureRepository.listByUser(userId, false);

      // Assert
      expect(mockPrisma.capture.findMany).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(result).toEqual(expectedCaptures);
    });
  });
});