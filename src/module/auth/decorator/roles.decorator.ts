import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/shared/constant/auth.constant';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
