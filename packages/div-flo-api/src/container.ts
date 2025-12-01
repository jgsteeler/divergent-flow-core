// =========================
// Dependency Injection Setup
// =========================

// External dependencies
import "reflect-metadata";
import { container } from "tsyringe";

// Model interfaces
import {
  IVersionService,
  IVersionRepository,
  IUserService,
  IUserRepository,
  ICaptureService,
  ICaptureRepository,
} from "@div-flo/models";

// Core implementations
import {
  VersionService,
  VersionRepository,
  UserService,
  UserRepository,
  CaptureService,
  CaptureRepository,
} from "@div-flo/core";
import { PrismaClient } from '@prisma/client';

// Controllers
import { CaptureController } from "./controllers/CaptureController";
import { UserController } from "./controllers/UserController";

// Auth
import { AuthProvider } from "./auth/AuthProvider";
import { Auth0AuthProvider } from "./auth/Auth0AuthProvider";

// Configure DI container
export function configureDI(): void {
  // --- Repository registrations ---
  // Register PrismaClient as singleton
  container.registerInstance<PrismaClient>('PrismaClient', new PrismaClient());
  container.register<IVersionRepository>("IVersionRepository", {
    useClass: VersionRepository,
  });
  container.register<IUserRepository>("IUserRepository", {
    useClass: UserRepository,
  });
  container.register<ICaptureRepository>("ICaptureRepository", {
    useFactory: (c) => new CaptureRepository(c.resolve<PrismaClient>('PrismaClient')),
  });

  // --- Service registrations ---
  container.register<IVersionService>("IVersionService", {
    useClass: VersionService,
  });
  container.register<IUserService>("IUserService", {
    useClass: UserService,
  });
  container.register<ICaptureService>("ICaptureService", {
    useClass: CaptureService,
  });

  // --- Controller registrations ---
  container.register<CaptureController>("CaptureController", {
    useClass: CaptureController,
  });
  container.register<UserController>("UserController", {
    useClass: UserController,
  });

  // --- Auth registrations ---
  container.register<AuthProvider>("AuthProvider", {
    useFactory: () => new Auth0AuthProvider(),
  });
}

export { container };
