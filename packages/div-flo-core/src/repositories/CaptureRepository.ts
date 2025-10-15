import { injectable } from "tsyringe";
import { ICaptureRepository } from "@div-flo/models/src/interfaces/ICaptureRepository";
import { Capture, PrismaClient, Prisma } from "@prisma/client";

@injectable()
export class CaptureRepository implements ICaptureRepository {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient ?? new PrismaClient();
  }

  async create(capture: Capture): Promise<Capture> {
    return this.prisma.capture.create({
      data: {
        id: capture.id,
        userId: capture.userId,
        rawText: capture.rawText,
        createdAt: capture.createdAt,
        updatedAt: capture.updatedAt,
        migratedDate: capture.migratedDate ?? undefined,
      },
    });
  }

  async findById(id: string): Promise<Capture | null> {
    return this.prisma.capture.findUnique({ where: { id } });
  }

  async update(capture: Capture): Promise<Capture> {
    return this.prisma.capture.update({
      where: { id: capture.id },
      data: {
        userId: capture.userId,
        rawText: capture.rawText,
        migratedDate: capture.migratedDate ?? undefined,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.capture.delete({ where: { id } });
  }

  async listByUser(userId: string): Promise<Capture[]> {
    return this.prisma.capture.findMany({ where: { userId } });
  }
}
