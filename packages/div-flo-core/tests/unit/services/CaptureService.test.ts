import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CaptureService } from '../../../src/services/CaptureService';
import { ICaptureRepository } from '@div-flo/models/src/interfaces/ICaptureRepository';
import { Capture } from '@prisma/client';

describe('CaptureService', () => {
  let repo: any;
  let service: CaptureService;

  beforeEach(() => {
    repo = {
      create: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      listByUser: vi.fn(),
    };
    service = new CaptureService(repo);
  });

  it('throws if userId or rawText is missing on create', async () => {
    await expect(service.createCapture({ rawText: 'foo' } as any)).rejects.toThrow('userId and rawText are required');
    await expect(service.createCapture({ userId: 'u1' } as any)).rejects.toThrow('userId and rawText are required');
  });

  it('calls repo.create with valid data', async () => {
    const data = { id: 'c1', userId: 'u1', rawText: 'foo', createdAt: new Date(), updatedAt: new Date() } as Capture;
    repo.create.mockResolvedValue(data);
    const result = await service.createCapture(data);
    expect(repo.create).toHaveBeenCalledWith(data);
    expect(result).toBe(data);
  });

  it('calls repo.findById', async () => {
    repo.findById.mockResolvedValue(null);
  await service.getCaptureById('c1');
    expect(repo.findById).toHaveBeenCalledWith('c1');
  });

  it('throws if id missing on update', async () => {
    await expect(service.updateCapture({} as any)).rejects.toThrow('id is required');
  });

  it('calls repo.update with valid data', async () => {
    const data = { id: 'c1', userId: 'u1', rawText: 'foo', createdAt: new Date(), updatedAt: new Date() } as Capture;
    repo.update.mockResolvedValue(data);
    const result = await service.updateCapture(data);
    expect(repo.update).toHaveBeenCalledWith(data);
    expect(result).toBe(data);
  });

  it('calls repo.delete', async () => {
    repo.delete.mockResolvedValue();
    await service.deleteCapture('c1');
    expect(repo.delete).toHaveBeenCalledWith('c1');
  });

  describe('listCapturesByUser', () => {
    it('throws if userId is missing', async () => {
      await expect(service.listCapturesByUser('')).rejects.toThrow('userId is required');
    });
    it('calls repo.listByUser and returns captures', async () => {
      const captures: Capture[] = [
        { id: 'c1', userId: 'u1', rawText: 'foo', createdAt: new Date(), updatedAt: new Date(), migratedDate: null },
        { id: 'c2', userId: 'u1', rawText: 'bar', createdAt: new Date(), updatedAt: new Date(), migratedDate: null },
      ];
      repo.listByUser.mockResolvedValue(captures);
      const result = await service.listCapturesByUser('u1');
      expect(repo.listByUser).toHaveBeenCalledWith('u1', undefined);
      expect(result).toBe(captures);
    });
    it('calls repo.listByUser with onlyUnmigrated flag', async () => {
      const captures: Capture[] = [
        { id: 'c1', userId: 'u1', rawText: 'foo', createdAt: new Date(), updatedAt: new Date(), migratedDate: null },
      ];
      repo.listByUser.mockResolvedValue(captures);
      const result = await service.listCapturesByUser('u1', true);
      expect(repo.listByUser).toHaveBeenCalledWith('u1', true);
      expect(result).toBe(captures);
    });
  });
});
