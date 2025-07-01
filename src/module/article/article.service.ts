import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from '../prisma/prisma.extension';
import { Inject, Injectable } from '@nestjs/common';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { AuthInfoDto } from '../auth/dto/auth.dto';
import { accessibleBy } from '@casl/prisma';

export enum ActionEnum {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

@Injectable()
export class ArticleService {
  constructor(
    @Inject('PrismaService')
    private readonly prisma: CustomPrismaService<ExtendedPrismaClient>,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async findManyThrow(authInfo: AuthInfoDto) {
    const ability = await this.caslAbilityFactory.createForUser(
      authInfo,
      'Article',
      'read',
    );
    console.log(ability.rules);
    return this.prisma.client.article.findMany({
      where: { AND: [accessibleBy(ability).Article] },
    });
  }

  async findOne(authInfo: AuthInfoDto) {
    const ability = await this.caslAbilityFactory.createForUser(
      authInfo,
      'Article',
      'read',
    );
    return this.prisma.client.article.findFirst({
      where: { id: 1, AND: accessibleBy(ability).Article },
    });
  }

  async update(authInfo: AuthInfoDto) {
    const ability = await this.caslAbilityFactory.createForUser(
      authInfo,
      'Article',
      'update',
    );
    // ability.rules.push();

    // return this.prisma.client.article.findFirst({
    //   where: { id: 1, AND: accessibleBy(ability).Article },
    // });
    return this.prisma.client.article.update({
      where: { id: 1, AND: accessibleBy(ability).Article },
      // where: {
      //   AND: [{ id: 1 }, accessibleBy(ability).Article],
      // },
      data: {
        description: 'Updated',
      },
    });
  }
}

// {
// success
//   userPermissions: [ { userId: 3, permissionId: 3, permission: [Object] } ] // update
// }

// {
//   userPermissions: [
//     { userId: 3, permissionId: 2, permission: [Object] }, // read
//     { userId: 3, permissionId: 3, permission: [Object] }, // update
//     { userId: 3, permissionId: 4, permission: [Object] } // delete
//   ]
// }
