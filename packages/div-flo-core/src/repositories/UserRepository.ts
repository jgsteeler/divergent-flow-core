import { injectable } from "tsyringe";
import { IUserRepository } from "@div-flo/models/src/interfaces/IUserRepository";
import { User } from "@prisma/client";
import { PrismaClient, Prisma } from "@prisma/client";

@injectable()
export class UserRepository implements IUserRepository {
    private prisma: PrismaClient;

    constructor(prismaClient?: PrismaClient) {
        this.prisma = prismaClient ?? new PrismaClient();
    }

    async create(user: User): Promise<User> {
        return this.prisma.user.create({
            data: {
                id: user.id,
                email: user.email,
                name: user.name,
                preferences: user.preferences === null ? Prisma.JsonNull : user.preferences,
                // createdAt and updatedAt are handled by Prisma defaults
            },
        });
    }
    async findById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { id } });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { email } });
    }

        async update(user: User): Promise<User> {
            // Only update allowed fields
            return this.prisma.user.update({
                where: { id: user.id },
                data: {
                    email: user.email,
                    name: user.name,
                    preferences: user.preferences === null ? Prisma.JsonNull : user.preferences,
                },
            });
        }

    async delete(id: string): Promise<void> {
        await this.prisma.user.delete({ where: { id } });
    }

        async list(): Promise<User[]> {
            return this.prisma.user.findMany();
        }
    }