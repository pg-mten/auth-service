import { Injectable } from '@nestjs/common';
import { AuthInfoDto } from '../auth/dto/auth.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findOneByEmailThrow(email: string) {
    return await this.prisma.user.findFirst({
      where: { email },
      include: { role: true },
    });
  }

  async findOneByAuthInfoThrow(authInfo: AuthInfoDto) {
    return this.prisma.user.findUniqueOrThrow({
      where: { email: authInfo.email },
      include: { role: true },
    });
  }
}
