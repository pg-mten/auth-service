import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UserService } from '../user.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class EmailUniqueValidator implements ValidatorConstraintInterface {
  constructor(private readonly userService: UserService) {}

  async validate(
    value: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    validationArguments?: ValidationArguments,
  ): Promise<boolean> {
    try {
      await this.userService.findOneByEmailThrow(value);
      return false;
    } catch {
      return true;
    }
  }
  defaultMessage?(validationArguments?: ValidationArguments): string {
    return `${validationArguments?.property} with value ${validationArguments?.value} must be unique`;
  }
}

export function EmailUnique(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: EmailUniqueValidator,
    });
  };
}
