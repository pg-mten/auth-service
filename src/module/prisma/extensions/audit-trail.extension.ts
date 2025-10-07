/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Prisma } from '@prisma/client';
import { ClsService } from 'nestjs-cls';
import { AuthInfoDto } from 'src/microservice/auth/dto/auth-info.dto';
import { DateHelper } from 'src/shared/helper/date.helper';

function hasData(args: any): args is { data: any } {
  return args && args.data;
}

export const AuditTrailExtension = (cls: ClsService) => {
  return Prisma.defineExtension({
    name: 'audit-trail-extension',
    query: {
      $allOperations: ({ model, operation, args, query }) => {
        const authInfo: AuthInfoDto | undefined = cls.get('authInfo');
        const userId = authInfo?.userId;
        const now = DateHelper.now().toJSDate();

        if (model) {
          if (operation === 'create' && hasData(args)) {
            args.data = {
              ...args.data,
              createdBy: userId ?? undefined,
              createdAt: now,
            };
          } else if (
            operation === 'createMany' &&
            hasData(args) &&
            Array.isArray(args.data)
          ) {
            args.data = args.data.map((item: any) => ({
              ...item,
              createdBy: userId ?? undefined,
              createdAt: now,
            }));
          } else if (operation === 'update' && hasData(args)) {
            args.data = {
              ...args.data,
              updatedBy: userId ?? undefined,
              updatedAt: now,
            };
          } else if (operation === 'updateMany' && hasData(args)) {
            args.data = {
              ...args.data,
              updatedBy: userId ?? undefined,
              updatedAt: now,
            };
          } else if (operation === 'delete') {
            operation = 'update';
            args.data = {
              deletedAt: now,
              deletedBy: userId ?? undefined,
            };
          } else if (operation === 'deleteMany') {
            operation = 'updateMany';
            args.data = {
              deletedAt: now,
              deletedBy: userId ?? undefined,
            };
          }
        }
        return query(args);
      },
    },
  });
};
