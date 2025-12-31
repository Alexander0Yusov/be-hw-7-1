import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsExpiresInFormat(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isExpiresInFormat',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          if (typeof value === 'number') return true;
          if (typeof value !== 'string') return false;
          return /^[0-9]+[smhd]$/.test(value); // Пример: 60s, 10m, 24h, 7d
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a number or a string like '60s', '10m', '24h', '7d'`;
        },
      },
    });
  };
}
