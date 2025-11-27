import 'reflect-metadata';
import { beforeEach, vi } from 'vitest';

// Global test setup for API tests
beforeEach(() => {
  vi.clearAllMocks();
  vi.resetAllMocks();
});