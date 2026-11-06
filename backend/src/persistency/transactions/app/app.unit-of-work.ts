import { UnitOfWork } from '../unit-of-work';
import type { AppRepositories } from './types/app-repositories.types';

export abstract class AppUnitOfWork extends UnitOfWork<AppRepositories> {}
