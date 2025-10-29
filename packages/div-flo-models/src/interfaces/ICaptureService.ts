import type { Capture } from '@prisma/client';

export interface ICaptureService {
  createCapture(capture: Capture): Promise<Capture>;
  getCaptureById(id: string): Promise<Capture | null>;
  updateCapture(capture: Capture): Promise<Capture>;
  deleteCapture(id: string): Promise<void>;
  listCapturesByUser(userId: string, onlyUnmigrated?: boolean): Promise<Capture[]>;
}
