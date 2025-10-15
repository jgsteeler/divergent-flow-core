import type { Capture } from '@prisma/client';

export interface ICaptureRepository {
  create(capture: Capture): Promise<Capture>;
  findById(id: string): Promise<Capture | null>;
  update(capture: Capture): Promise<Capture>;
  delete(id: string): Promise<void>;
  listByUser(userId: string): Promise<Capture[]>;
}
