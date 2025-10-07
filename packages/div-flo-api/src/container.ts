import 'reflect-metadata';
import { container } from 'tsyringe';
import { IVersionService, IVersionRepository } from '@div-flo/models';
import { VersionService, VersionRepository } from '@div-flo/core';

// Configure DI container
export function configureDI(): void {
  // Register repository
  container.register<IVersionRepository>('IVersionRepository', {
    useClass: VersionRepository
  });

  // Register service  
  container.register<IVersionService>('IVersionService', {
    useClass: VersionService
  });
}

export { container };