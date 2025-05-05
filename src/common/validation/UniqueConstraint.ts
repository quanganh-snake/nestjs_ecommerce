import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';

export interface TIsUniqueConstraint {
  tableName: string;
  columnName: string;
  ignoreId?: number;
}

@Injectable()
@ValidatorConstraint({ name: 'IsUniqueConstraint', async: true })
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private readonly entityManager: EntityManager) {}

  async validate(value: any, args?: ValidationArguments): Promise<boolean> {
    if (!value) return true; // if value is null or undefined, return true

    // catch options from decorator
    const { tableName, columnName, ignoreId }: TIsUniqueConstraint = args
      ? args.constraints[0]
      : {};

    // database query check data is exists
    const dataExist = await this.entityManager
      .getRepository(tableName)
      .createQueryBuilder(tableName)
      .where({ [columnName]: value });

    if (ignoreId) {
      dataExist.andWhere({ id: ignoreId });
    }

    const result = await dataExist.getExists();

    return !result;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    // return custom field message
    const field: string = validationArguments
      ? validationArguments.property
      : '';
    return `${field} is already exist`;
  }
}

export function isUnique(
  options: TIsUniqueConstraint,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isUnique',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [options],
      validator: IsUniqueConstraint,
    });
  };
}
