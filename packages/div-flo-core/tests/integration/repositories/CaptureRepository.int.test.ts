import 'reflect-metadata';
import { PrismaClient, Capture, Prisma } from '@prisma/client';
import { CaptureRepository } from '../../../src/repositories/CaptureRepository';

describe('CaptureRepository (integration)', () => {
  const prisma = new PrismaClient();
  const repo = new CaptureRepository(prisma);
  let testCapture: Capture;
  let userId: string;

  beforeEach(async () => {
    await prisma.user.deleteMany();
    await prisma.capture.deleteMany();
    const user = await prisma.user.create({
      data: {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        emailVerified: false,
      },
    });
    userId = user.id;

    testCapture = await prisma.capture.create({
      data: {
        id: 'cap-1',
        userId,
        rawText: 'test capture',
        migratedDate: null,
      },
    });
  });

  afterEach(async () => {
    await prisma.capture.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates a capture', async () => {
    const newCapture = await repo.create({
      id: 'cap-2',
      userId,
      rawText: 'new capture',
      migratedDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(newCapture.rawText).toBe('new capture');
    const found = await prisma.capture.findUnique({ where: { id: 'cap-2' } });
    expect(found).not.toBeNull();
  });

  it('finds a capture by id', async () => {
    const found = await repo.findById(testCapture.id);
    expect(found?.rawText).toBe('test capture');
  });

  it('updates a capture', async () => {
    const updated = await repo.update({ ...testCapture, rawText: 'updated' });
    expect(updated.rawText).toBe('updated');
  });

  it('deletes a capture', async () => {
    await repo.delete(testCapture.id);
    const found = await prisma.capture.findUnique({ where: { id: testCapture.id } });
    expect(found).toBeNull();
  });

  it('lists captures by user', async () => {
    const captures = await repo.listByUser(userId);
    expect(captures.length).toBeGreaterThan(0);
  });
});
