/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Prisma } from '@prisma/client';
import { DateHelper } from 'src/shared/helper/date.helper';

type UserIdGetter = () => number | null;

export function auditMiddleware(getUserId: UserIdGetter): Prisma.Middleware {
  return async (params, next) => {
    const userId = getUserId();
    const now = DateHelper.now();

    if (
      params.model &&
      ['create', 'update', 'delete'].includes(params.action)
    ) {
      const data = params.args?.data ?? {};

      if (params.action === 'create') {
        params.args.data = {
          ...data,
          createdBy: userId ?? undefined,
          createdAt: now,
        };
      }

      if (params.action === 'update') {
        params.args.data = {
          ...data,
          updatedBy: userId ?? undefined,
          updatedAt: now,
        };
      }

      if (params.action === 'delete') {
        // Optional: soft delete
        params.action = 'update';
        params.args.data = {
          ...data,
          deletedBy: userId ?? undefined,
          deletedAt: now,
        };
      }
    }

    return next(params);
  };
}
