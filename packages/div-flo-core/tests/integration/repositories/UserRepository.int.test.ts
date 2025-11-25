import 'reflect-metadata';
import { PrismaClient, User, Prisma } from '@prisma/client';
import { UserRepository } from '../../../src/repositories/UserRepository';

const skipIfNoDb = process.env.DB_UNAVAILABLE === 'true' ? describe.skip : describe;

skipIfNoDb('UserRepository (integration)', () => {
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
    // Clean slate in a single transaction to respect FK order and avoid partial cleanup
    await prisma.$transaction([
      prisma.capture.deleteMany(), // dependent records first
      prisma.oAuthAccount.deleteMany(),
      prisma.userProfile.deleteMany(),
      prisma.user.deleteMany(),
    ]);
    testUser = await prisma.user.create({
      data: {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        emailVerified: false,
      },
    });
  });


  it('finds a user by id', async () => {
    const found = await repo.findById(testUser.id);
    expect(found?.email).toBe('test@example.com');
  });

  it('finds a user by email', async () => {
    const found = await repo.findByEmail('test@example.com');
    expect(found?.id).toBe('user-1');
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
