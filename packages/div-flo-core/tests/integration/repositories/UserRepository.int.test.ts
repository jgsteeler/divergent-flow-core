import 'reflect-metadata';
import { PrismaClient, User, Prisma } from '@prisma/client';
import { UserRepository } from '../../../src/repositories/UserRepository';

describe('UserRepository (integration)', () => {
  const prisma = new PrismaClient();
  const repo = new UserRepository(prisma);
  let testUser: User;

  beforeAll(async () => {
    // Optionally run migrations here
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.capture.deleteMany(); // Clean up dependent records first
    await prisma.user.deleteMany();
    testUser = await prisma.user.create({
      data: {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        preferences: Prisma.JsonNull,
      },
    });
  });

  it('creates a user', async () => {
    const newUser = await repo.create({
      id: 'user-2',
      email: 'new@example.com',
      name: 'New User',
      preferences: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(newUser.email).toBe('new@example.com');
    const found = await prisma.user.findUnique({ where: { id: 'user-2' } });
    expect(found).not.toBeNull();
  });

  it('finds a user by id', async () => {
    const found = await repo.findById(testUser.id);
    expect(found?.email).toBe('test@example.com');
  });

  it('finds a user by email', async () => {
    const found = await repo.findByEmail('test@example.com');
    expect(found?.id).toBe('user-1');
  });

  it('updates a user', async () => {
    const updated = await repo.update({ ...testUser, name: 'Updated' });
    expect(updated.name).toBe('Updated');
  });

  it('deletes a user', async () => {
    await repo.delete(testUser.id);
    const found = await prisma.user.findUnique({ where: { id: testUser.id } });
    expect(found).toBeNull();
  });

  it('lists users', async () => {
    const users = await repo.list();
    expect(users.length).toBeGreaterThan(0);
  });
});
