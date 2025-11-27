import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VersionController } from '../../src/controllers/VersionController';
import { IVersionService } from '@div-flo/models';
import { Request, Response } from 'express';

describe('VersionController', () => {
  let controller: VersionController;
  let mockService: any;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    mockService = {
      getVersion: vi.fn(),
    };
    controller = new VersionController(mockService);
    req = {};
    res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
  });

  it('should get version info', async () => {
    mockService.getVersion.mockResolvedValue({ version: '1.0.0', service: 'api', timestamp: '2025-10-16T00:00:00Z' });
    await controller['getVersion'](req as Request, res as Response);
    expect(res.json).toHaveBeenCalledWith({ version: '1.0.0', service: 'api', timestamp: '2025-10-16T00:00:00Z' });
  });

  // Add more tests for error cases
});
