import { ApiProperty } from '@nestjs/swagger';

export class ProfieAdminDetailDto {
  constructor(data: ProfieAdminDetailDto) {
    // Object.assign(this, data);
    const allowedKeys = Object.keys(this) as (keyof ProfieAdminDetailDto)[];
    for (const key of allowedKeys) {
      if (key in data) {
        this[key] = data[key] as any;
      }
    }
  }

  @ApiProperty({ type: String })
  fullname: string;

  @ApiProperty({ type: String })
  address: string;

  @ApiProperty({ type: String })
  phone: string;
}
