import { Injectable } from '@nestjs/common';
import { UserInputDto } from '../dto/user/user-input.dto';
import { User } from '../domain/user/user.entity';
import { UsersRepository } from '../infrastructure/users.repository';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UpdateUserDto } from '../dto/user/create-user-domain.dto';
import { EmailService } from '../../mailer/email.service';
import { addDays } from 'date-fns';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class UsersService {
  constructor(
    //инжектирование модели в сервис через DI
    // @InjectModel(User.name)
    //private UserModel: any, // UserModelType,
    private usersRepository: UsersRepository,
    private emailService: EmailService,
  ) {}
}
