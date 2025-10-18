import { injectable, inject } from 'tsyringe';
import { IUserRepository, IUserService } from '@div-flo/models';
import { User } from '@prisma/client';

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject('IUserRepository') private repo: IUserRepository
  ) {}

  async createUser(user: User): Promise<User> {
    if (!user.email || !user.name) {
      throw new Error('email and name are required');
    }
    return this.repo.create(user);
  }

  async getUserById(id: string): Promise<User | null> {
    return this.repo.findById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.repo.findByEmail(email);
  }

  async updateUser(user: User): Promise<User> {
    if (!user.id) throw new Error('id is required');
    return this.repo.update(user);
  }

  async deleteUser(id: string): Promise<void> {
    return this.repo.delete(id);
  }

  async listUsers(): Promise<User[]> {
    return this.repo.list();
  }
}