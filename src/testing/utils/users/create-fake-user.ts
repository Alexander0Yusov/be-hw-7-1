import { UserInputDto } from 'src/modules/user-accounts/dto/user/user-input.dto';

export const createFakeUser = (uniqueSymbol: string = 'x'): UserInputDto => {
  return {
    login: `fakeLogin${uniqueSymbol}`,
    email: `fakeemail${uniqueSymbol}@gmail.com`,
    password: 'qwerty123',
  };
};
