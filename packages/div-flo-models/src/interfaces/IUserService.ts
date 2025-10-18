import type { User } from '@prisma/client';

export interface IUserService {
  createUser(user: User): Promise<User>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  updateUser(user: User): Promise<User>;
  deleteUser(id: string): Promise<void>;
  listUsers(): Promise<User[]>;
}
