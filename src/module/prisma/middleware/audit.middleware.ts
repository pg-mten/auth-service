/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Prisma } from '@prisma/client';

type UserIdGetter = () => number | null;

export function auditMiddleware(getUserId: UserIdGetter): Prisma.Middleware {
  return async (params, next) => {
    const userId = getUserId();
    const now = new Date();

    if (
      params.model &&
      ['create', 'update', 'delete'].includes(params.action)
    ) {
      const data = params.args?.data ?? {};

      if (params.action === 'create') {
        params.args.data = {
          ...data,
          created_by: userId ?? undefined,
          created_at: now,
        };
      }

      if (params.action === 'update') {
        params.args.data = {
          ...data,
          updated_by: userId ?? undefined,
          updated_at: now,
        };
      }

      if (params.action === 'delete') {
        // Optional: soft delete
        params.action = 'update';
        params.args.data = {
          ...data,
          deleted_by: userId ?? undefined,
          deleted_at: now,
        };
      }
    }

    return next(params);
  };
}
